#!/usr/bin/env python3
"""Persist a reviewed release-retention preflight, then explicitly finalize it.

This wrapper does not publish, create acceptance, schedule cleanup, delete files,
or prune Docker. The existing Finalizer remains the only image-removal engine.
"""
import argparse
import copy
import fcntl
import json
import os
from pathlib import Path

import release_retention as retention


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':')).encode()


def tool_digest():
    return retention.digest(Path(__file__).read_bytes())


def retention_tool_digest():
    return retention.digest(Path(retention.__file__).read_bytes())


def fresh_directory(path, root):
    path, root = Path(path), Path(root).absolute()
    if (not path.is_absolute() or path.resolve() != path or not path.is_relative_to(root)
            or not path.parent.is_dir() or any(p.is_symlink() for p in [path, *path.parents])):
        raise ValueError('Closeout output must be a new directory inside the records root')
    path.mkdir(mode=0o700)  # Never reuse or overwrite an earlier evidence directory.
    return path


def configuration(state):
    live = Path(state['plan']['live'])
    paths = set([*live.glob('*.yml'), *live.glob('*.yaml')])
    pins = live / 'RETENTION_PROTECTED_IMAGES.json'
    if pins.exists() or pins.is_symlink():
        paths.add(pins)
    return {str(p): retention.digest(retention.read_file(p, live)) for p in sorted(paths)}


def snapshot(state):
    return {key: copy.deepcopy(state[key]) for key in [
        'planSha256', 'acceptanceSha256', 'containers', 'images', 'protected', 'targets', 'skipped'
    ]} | {'configurationSha256': configuration(state)}


class ObservedDocker:
    def __init__(self, engine):
        self.engine, self.removed = engine, []

    def images(self):
        return self.engine.images()

    def containers(self):
        return self.engine.containers()

    def remove(self, image_id):
        self.engine.remove(image_id)
        self.removed.append(image_id)


class ReviewedFinalizer(retention.Finalizer):
    """Keep the reviewed inventory stable, allowing only our successful removals."""
    def __init__(self, plan, acceptance, root, engine, reviewed):
        self.observed = ObservedDocker(engine)
        super().__init__(plan, acceptance, root, self.observed)
        self.reviewed = reviewed

    def inspect(self):
        state = super().inspect()
        current = snapshot(state)
        if not self.observed.removed:
            if current != self.reviewed:
                raise RuntimeError('Closeout state changed since the reviewed preflight; nothing further removed')
        else:
            expected = copy.deepcopy(self.reviewed)
            for image in self.observed.removed:
                expected['images'].pop(image)
            # Finalizer correctly reports removed targets as absent on a fresh read.
            for key in ['targets', 'skipped']:
                expected.pop(key)
                current.pop(key)
            if current != expected:
                raise RuntimeError('Closeout state changed during finalization; nothing further removed')
        return state


class Closeout:
    def __init__(self, plan, acceptance, records_root, engine=None):
        self.plan, self.acceptance = Path(plan), Path(acceptance)
        self.root, self.engine = Path(records_root).absolute(), engine or retention.Docker()

    def run(self, output, apply=False, reviewed_preflight=None):
        if apply and reviewed_preflight is None:
            raise ValueError('Apply requires the retained preflight from this exact release')
        if not apply and reviewed_preflight is not None:
            raise ValueError('Reviewed preflight is used only with explicit apply')
        output = fresh_directory(output, self.root)
        receipt = {'schemaVersion': 1, 'startedAt': retention.now().isoformat(),
                   'toolSha256': tool_digest(), 'retentionToolSha256': retention_tool_digest(),
                   'plan': str(self.plan), 'acceptance': str(self.acceptance),
                   'applied': apply, 'passed': False}
        retention.write_json(output / 'started.json', receipt)
        raw = None
        native_before = set(self.plan.parent.glob('retention-*'))
        try:
            initial = retention.Finalizer(self.plan, self.acceptance, self.root, self.engine).inspect()
            state = snapshot(initial)
            receipt.update(planSha256=initial['planSha256'], acceptanceSha256=initial['acceptanceSha256'])
            if apply:
                reviewed_bytes = retention.read_file(reviewed_preflight, self.root)
                reviewed = json.loads(reviewed_bytes)
                if (reviewed.get('schemaVersion') != 1 or reviewed.get('passed') is not True
                        or reviewed.get('applied') is not False or reviewed.get('toolSha256') != tool_digest()
                        or reviewed.get('retentionToolSha256') != retention_tool_digest()
                        or reviewed.get('plan') != str(self.plan) or reviewed.get('acceptance') != str(self.acceptance)
                        or reviewed.get('snapshotSha256') != retention.digest(canonical(reviewed.get('snapshot')))
                        or reviewed.get('snapshot') != state):
                    raise ValueError('Retained preflight does not match this tool and exact current release state')
                receipt.update(reviewedPreflight=str(reviewed_preflight),
                               reviewedPreflightSha256=retention.digest(reviewed_bytes))
            finalizer = ReviewedFinalizer(self.plan, self.acceptance, self.root, self.engine, state)
            raw = finalizer.execute(apply=apply)
            retention.write_json(output / 'retention-result.json', raw)
            if apply:
                finalizer.inspect()  # Recheck healthy services, recovery boundaries and configuration after cleanup.
            if not apply:
                preflight = {**receipt, 'passed': True, 'snapshot': state,
                             'snapshotSha256': retention.digest(canonical(state)), 'result': raw}
                retention.write_json(output / 'preflight.json', preflight)
                receipt.update(preflight=str(output / 'preflight.json'), status='preflight-passed')
            else:
                removed = raw['removed']
                receipt.update(status='retired-images' if removed else 'no-images-to-retire',
                               deletedImageCount=len(removed), removed=removed,
                               observedFreeBytesChange=raw['freeBytesAfter'] - raw['freeBytesBefore'],
                               reclaimedBytes=raw['reclaimedBytes'] if removed else 0)
            receipt['passed'] = True
        except Exception as error:
            receipt.update(status='failed', failureType=type(error).__name__)
            raise
        finally:
            capture_error, successful = None, receipt['passed']
            try:
                native_after = set(self.plan.parent.glob('retention-*')) - native_before
                if apply and raw is not None and len(native_after) != 1:
                    raise RuntimeError('The original retention result could not be uniquely located')
                if apply and len(native_after) == 1:
                    native = native_after.pop() / 'result.json'
                    data = retention.read_file(native, self.root)
                    native_result = json.loads(data)
                    if raw is not None and native_result != raw:
                        raise RuntimeError('The original retention result changed before closeout')
                    receipt.update(nativeResult=str(native), nativeResultSha256=retention.digest(data))
                    if raw is None:
                        retention.write_json(output / 'retention-result.json', native_result)
            except Exception as error:
                capture_error = error
                receipt.update(passed=False, status='failed', nativeCaptureFailureType=type(error).__name__)
            receipt['finishedAt'] = retention.now().isoformat()
            retention.write_json(output / 'closeout-result.json', receipt)
            if successful and capture_error is not None:
                raise capture_error
        return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', type=Path, required=True)
    parser.add_argument('--acceptance', type=Path, required=True)
    parser.add_argument('--records-root', type=Path, default=Path('/data/migration-rehearsals'))
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--reviewed-preflight', type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    try:
        with open('/var/lock/corp-site-deploy.lock', 'a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            result = Closeout(args.plan, args.acceptance, args.records_root).run(
                args.output_dir, args.apply, args.reviewed_preflight)
        print(json.dumps(result))
    except Exception as error:
        print(json.dumps({'passed': False, 'failureType': type(error).__name__}))
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
