#!/usr/bin/env python3
"""Finalize an accepted website release, retiring only its superseded images.

No directory, archive, container, volume, backup, or other application's image
is deleted. Publication and cleanup are separate transactions: a cleanup failure
must never roll back a healthy publication.
"""
import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import uuid

IMAGE = re.compile(r'^sha256:[0-9a-f]{64}$')
SHA = re.compile(r'^[0-9a-f]{40}$')
DIGEST = re.compile(r'^[0-9a-f]{64}$')
COMPONENTS = ('frontend', 'backend', 'admin')


def now():
    return dt.datetime.now(dt.timezone.utc)


def write_json(path, value):
    temporary = path.with_name(path.name + '.writing')
    with temporary.open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')
        f.flush()
        os.fsync(f.fileno())
    temporary.replace(path)


def read_file(path, root):
    path, root = Path(path), Path(root).absolute()
    if not path.is_absolute() or path.resolve() != path or not path.is_relative_to(root):
        raise ValueError('Evidence is outside its configured records directory')
    if any(p.is_symlink() for p in [path, *path.parents]) or not path.is_file():
        raise ValueError('Evidence must be a regular file without symlink ancestors')
    before = path.stat()
    data = path.read_bytes()
    after = path.stat()
    if (before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns):
        raise RuntimeError('Evidence changed while being read')
    return data


def digest(data):
    return hashlib.sha256(data).hexdigest()


def queue(live, audit, components, source_commit):
    """Called only after successful publication. This performs no Docker mutation."""
    live, audit = Path(live).absolute(), Path(audit).absolute()
    receipt = live / 'RELEASE_ARTIFACTS.json'
    previous = audit / 'previous-receipt.json'
    value = {'schemaVersion': 1, 'createdAt': now().isoformat(), 'live': str(live),
             'receiptSha256': digest(receipt.read_bytes()),
             'previousReceipt': str(previous), 'previousReceiptSha256': digest(previous.read_bytes()),
             'operationReceipt': str(audit / 'result.json'), 'components': components,
             'sourceCommit': source_commit, 'acceptanceRequired': True}
    path = audit / 'retention-pending.json'
    write_json(path, value)
    return {'status': 'awaiting-acceptance', 'plan': str(path)}


class Docker:
    def run(self, args):
        result = subprocess.run(['docker', *args], capture_output=True, text=True, timeout=90)
        if result.returncode:
            raise RuntimeError('Docker retention check failed')
        return result.stdout

    def images(self):
        ids = sorted(set(self.run(['image', 'ls', '-q', '--no-trunc']).split()))
        rows = json.loads(self.run(['image', 'inspect', *ids])) if ids else []
        return {r['Id']: {'id': r['Id'], 'tags': sorted(r.get('RepoTags') or []),
                         'labels': r.get('Config', {}).get('Labels') or {},
                         'layers': r.get('RootFS', {}).get('Layers', [])} for r in rows}

    def containers(self):
        ids = self.run(['ps', '-aq']).split()
        rows = json.loads(self.run(['inspect', *ids])) if ids else []
        return sorted([{'name': r['Name'], 'id': r['Id'], 'image': r['Image'],
                        'running': r['State']['Running'], 'started': r['State']['StartedAt'],
                        'health': r['State'].get('Health', {}).get('Status')}
                       for r in rows], key=lambda r: r['id'])

    def remove(self, image_id):
        # Deliberately no --force, broad prune, mutable tag, or filesystem delete.
        self.run(['image', 'rm', image_id])


def boundaries(receipt):
    protected = set()
    for component in COMPONENTS:
        meta = receipt.get(component + 'Release', {})
        current, previous = receipt.get('images', {}).get(component), meta.get('expectedCurrentImage')
        if not all(isinstance(x, str) and IMAGE.fullmatch(x) for x in [current, previous]):
            raise ValueError('Current and rollback identities must be recorded for every component')
        if meta.get('image') != current or previous == current:
            raise ValueError('Component recovery boundary is inconsistent')
        protected.update([current, previous])
    return protected


def recorded_version(component, image_id, receipt, records_root):
    """Use accepted history, never image dates/tags alone, to establish ownership."""
    seen = set()
    for _ in range(128):
        meta = receipt.get(component + 'Release', {})
        if (receipt.get('deploymentStatus') == 'verified'
                and receipt.get('images', {}).get(component) == image_id
                and meta.get('image') == image_id and meta.get('sourceIdentity') == 'git-commit'
                and SHA.fullmatch(meta.get('sourceCommit', ''))
                and DIGEST.fullmatch(meta.get('archiveSha256', ''))):
            return meta['sourceCommit']
        previous = receipt.get('previousReceipt')
        if not previous or previous in seen:
            return None
        seen.add(previous)
        receipt = json.loads(read_file(previous, records_root))
    raise ValueError('Release history exceeds the retention traversal limit')


def owned_image(image, component, source):
    return (image.get('labels', {}).get('org.opencontainers.image.revision') == source
            and image.get('tags') == [f'suneng-verified-{component}:{source}']
            and bool(image.get('layers')))


def validate_acceptance(value, plan, receipt, operation_bytes, records_root):
    if not all(value.get(k) is True for k in ['passed', 'browserPassed', 'recoveryVerified']):
        raise ValueError('Successful browser and recovery acceptance must be recorded')
    if (value.get('schemaVersion') != 1 or value.get('sourceCommit') != plan['sourceCommit']
            or value.get('images') != receipt['images']
            or value.get('operationReceiptSha256') != digest(operation_bytes)):
        raise ValueError('Acceptance does not belong to this exact release')
    checked = dt.datetime.fromisoformat(value['checkedAt'].replace('Z', '+00:00'))
    published = dt.datetime.fromisoformat(receipt['productionVerifiedAt'].replace('Z', '+00:00'))
    if checked.tzinfo is None or published.tzinfo is None or not published <= checked <= now():
        raise ValueError('Acceptance must be recorded after publication')
    if (now() - checked).total_seconds() > 86400:
        raise ValueError('Refresh acceptance older than 24 hours')
    evidence = value.get('evidence', [])
    if not isinstance(evidence, list) or not evidence:
        raise ValueError('Acceptance requires retained browser and recovery evidence')
    purposes = set()
    for item in evidence:
        data = read_file(item['path'], records_root)
        if not data or digest(data) != item.get('sha256'):
            raise ValueError('Acceptance evidence is missing or has changed')
        purposes.add(item.get('purpose'))
    if not {'browser', 'recovery'} <= purposes:
        raise ValueError('Both browser and recovery evidence must be retained')


class Finalizer:
    def __init__(self, plan_path, acceptance_path, records_root, docker=None):
        self.plan_path, self.acceptance_path = Path(plan_path), Path(acceptance_path)
        self.root, self.docker = Path(records_root).absolute(), docker or Docker()

    def inspect(self):
        plan_bytes = read_file(self.plan_path, self.root)
        plan = json.loads(plan_bytes)
        if (plan.get('schemaVersion') != 1 or not SHA.fullmatch(plan.get('sourceCommit', ''))
                or not plan.get('components') or not set(plan['components']) <= set(COMPONENTS)):
            raise ValueError('Invalid website release finalization plan')
        live = Path(plan['live'])
        for marker in ['DEPLOYMENT_IN_PROGRESS.json', '.DO_NOT_DEPLOY']:
            if (live / marker).exists() or (live / marker).is_symlink():
                raise RuntimeError('Publication is incomplete or blocked')
        receipt_bytes = read_file(live / 'RELEASE_ARTIFACTS.json', live)
        previous_bytes = read_file(plan['previousReceipt'], self.root)
        if digest(receipt_bytes) != plan['receiptSha256'] or digest(previous_bytes) != plan['previousReceiptSha256']:
            raise RuntimeError('Release state changed after the cleanup plan was created')
        receipt, previous = json.loads(receipt_bytes), json.loads(previous_bytes)
        operation_bytes = read_file(plan['operationReceipt'], self.root)
        operation = json.loads(operation_bytes)
        if (receipt.get('deploymentStatus') != 'verified' or receipt.get('releaseOperation') != 'deploy'
                or receipt.get('releaseOperationReceipt') != plan['operationReceipt']
                or receipt.get('previousReceipt') != plan['previousReceipt']
                or operation.get('passed') is not True or operation.get('applied') is not True
                or operation.get('kind') != 'deploy' or operation.get('components') != plan['components']):
            raise ValueError('Only a successfully applied deployment can be finalized')
        acceptance_bytes = read_file(self.acceptance_path, self.root)
        validate_acceptance(json.loads(acceptance_bytes), plan, receipt, operation_bytes, self.root)
        protected = boundaries(receipt)
        images, containers = self.docker.images(), self.docker.containers()
        if not protected <= images.keys():
            raise RuntimeError('A current or rollback image is missing')
        for component in COMPONENTS:
            current = next((c for c in containers if c['name'] == '/corp-site-' + component), None)
            if (not current or current['image'] != receipt['images'][component] or not current['running']
                    or current['health'] != 'healthy'):
                raise RuntimeError('The running website does not match its healthy release receipt')
            for ident in [receipt['images'][component], receipt[component + 'Release']['expectedCurrentImage']]:
                source = recorded_version(component, ident, receipt, self.root)
                if not source or not owned_image(images[ident], component, source):
                    raise RuntimeError('Current/rollback recovery ownership is not verified')
        pins = live / 'RETENTION_PROTECTED_IMAGES.json'
        if pins.exists() or pins.is_symlink():
            pinned = json.loads(read_file(pins, live))
            if not isinstance(pinned, list) or not all(isinstance(i, str) and IMAGE.fullmatch(i) for i in pinned):
                raise ValueError('Invalid explicit image protection list')
            protected.update(pinned)
        used = {c['image'] for c in containers}
        targets, skipped = [], []
        for component in sorted(set(plan['components'])):
            if previous.get('images', {}).get(component) != receipt[component + 'Release']['expectedCurrentImage']:
                raise RuntimeError('The preserved rollback is not the replaced component')
            ident = previous.get(component + 'Release', {}).get('expectedCurrentImage')
            if not isinstance(ident, str) or not IMAGE.fullmatch(ident):
                skipped.append({'component': component, 'reason': 'No verified older image identity'})
                continue
            if ident not in images:
                skipped.append({'component': component, 'image': ident, 'reason': 'Already absent'})
                continue
            source = recorded_version(component, ident, previous, self.root)
            if (ident in protected or ident in used or not source
                    or not owned_image(images[ident], component, source)
                    or images[ident]['labels'].get('org.jssngyl.retention.protect') == 'true'):
                skipped.append({'component': component, 'image': ident, 'reason': 'Protected, referenced, or unverified'})
                continue
            # Active compose/override files may pin a version outside the receipt.
            references = False
            for config in [*live.glob('*.yml'), *live.glob('*.yaml')]:
                content = read_file(config, live).decode()
                if ident in content or images[ident]['tags'][0] in content:
                    references = True
            if references:
                skipped.append({'component': component, 'image': ident, 'reason': 'Referenced by active configuration'})
            else:
                targets.append({'component': component, 'image': ident, 'identity': images[ident]})
        return {'plan': plan, 'planSha256': digest(plan_bytes), 'acceptanceSha256': digest(acceptance_bytes),
                'containers': containers, 'images': images, 'protected': sorted(protected),
                'targets': targets, 'skipped': skipped}

    def execute(self, apply=False):
        state = self.inspect()
        result = {'schemaVersion': 1, 'at': now().isoformat(), 'applied': apply,
                  'planSha256': state['planSha256'], 'acceptanceSha256': state['acceptanceSha256'],
                  'targets': [{k: t[k] for k in ['component', 'image']} for t in state['targets']],
                  'skipped': state['skipped'], 'removed': [], 'protected': state['protected']}
        if not apply:
            return result
        audit = self.plan_path.parent / ('retention-' + uuid.uuid4().hex[:12])
        audit.mkdir(mode=0o700)
        result['freeBytesBefore'] = shutil.disk_usage(state['plan']['live']).free
        write_json(audit / 'started.json', result)
        try:
            for target in state['targets']:
                fresh = self.inspect()
                if (fresh['containers'] != state['containers'] or fresh['planSha256'] != state['planSha256']
                        or fresh['acceptanceSha256'] != state['acceptanceSha256']
                        or target not in fresh['targets']):
                    raise RuntimeError('Cleanup state changed; remaining images retained')
                self.docker.remove(target['image'])
                result['removed'].append(target['image'])
                write_json(audit / 'progress.json', result)
            remaining = self.docker.images()
            expected = {i: row for i, row in state['images'].items() if i not in result['removed']}
            if (remaining != expected
                    or self.docker.containers() != state['containers']):
                raise RuntimeError('Service or image inventory changed during finalization')
            result['passed'] = True
        except Exception as error:
            result.update(passed=False, failureType=type(error).__name__)
            raise
        finally:
            result['freeBytesAfter'] = shutil.disk_usage(state['plan']['live']).free
            result['reclaimedBytes'] = result['freeBytesAfter'] - result['freeBytesBefore']
            write_json(audit / 'result.json', result)
        return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', type=Path, required=True)
    parser.add_argument('--acceptance', type=Path, required=True)
    parser.add_argument('--records-root', type=Path, default=Path('/data/migration-rehearsals'))
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    os.umask(0o077)
    with open('/var/lock/corp-site-deploy.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        print(json.dumps(Finalizer(args.plan, args.acceptance, args.records_root).execute(args.apply)))


if __name__ == '__main__':
    main()
