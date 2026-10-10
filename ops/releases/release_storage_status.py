#!/usr/bin/env python3
"""Read current release cleanup evidence and real disk space; never mutate anything."""
import argparse
import json
import os
from pathlib import Path
import shutil
import stat

import release_retention as retention
import storage_policy as storage

MAX_CANDIDATE_BYTES = 1024 * 1024


def metadata_bytes(path, root=None):
    """Bound state JSON reads, including growth during reading."""
    path = storage._safe_absolute_path(path)
    if path.resolve() != path or (root is not None and not path.is_relative_to(Path(root).absolute())):
        raise ValueError('Metadata is outside its configured records directory')
    before = path.stat()
    if (not stat.S_ISREG(before.st_mode) or before.st_nlink != 1
            or before.st_size > MAX_CANDIDATE_BYTES):
        raise ValueError('Metadata must be a regular single-link file of at most 1 MiB')
    with os.fdopen(os.open(path, os.O_RDONLY | os.O_NOFOLLOW), 'rb') as stream:
        if storage._file_identity(before) != storage._file_identity(os.fstat(stream.fileno())):
            raise ValueError('Metadata changed before reading')
        data = stream.read(MAX_CANDIDATE_BYTES + 1)
        after_read = os.fstat(stream.fileno())
    after = storage._safe_absolute_path(path).stat()
    if (len(data) > MAX_CANDIDATE_BYTES or len(data) != before.st_size
            or storage._file_identity(before) != storage._file_identity(after_read)
            or storage._file_identity(before) != storage._file_identity(after)):
        raise ValueError('Metadata changed during reading')
    return data


def candidate_metadata(path, expected_digest):
    if not isinstance(expected_digest, str) or not retention.DIGEST.fullmatch(expected_digest):
        raise ValueError('An external candidate SHA256 is required')
    data = metadata_bytes(path)
    if retention.digest(data) != expected_digest:
        raise ValueError('Candidate SHA256 does not match the external binding')
    value = json.loads(data)
    if not isinstance(value, dict):
        raise ValueError('A candidate object is required')
    return value


def historical_acceptance(accepted, plan, receipt, operation_bytes, records_root):
    """Recheck retained evidence without expiring a completed cleanup after 24 hours."""
    if (accepted.get('schemaVersion') != 1
            or not all(accepted.get(k) is True for k in ['passed', 'browserPassed', 'recoveryVerified'])
            or accepted.get('sourceCommit') != plan['sourceCommit']
            or accepted.get('images') != receipt['images']
            or accepted.get('operationReceiptSha256') != retention.digest(operation_bytes)):
        raise ValueError('Accepted operation evidence changed after successful closeout')
    checked = retention.dt.datetime.fromisoformat(accepted['checkedAt'].replace('Z', '+00:00'))
    published = retention.dt.datetime.fromisoformat(receipt['productionVerifiedAt'].replace('Z', '+00:00'))
    if checked.tzinfo is None or published.tzinfo is None or not published <= checked <= retention.now():
        raise ValueError('Recorded acceptance time is invalid')
    evidence = accepted.get('evidence')
    if not isinstance(evidence, list) or not evidence:
        raise ValueError('Retained acceptance evidence is required')
    purposes = set()
    for item in evidence:
        # capture=False streams the actual file; it never materializes a large evidence pack.
        path = storage._safe_absolute_path(item['path'])
        if not path.is_relative_to(records_root):
            raise ValueError('Retained evidence is outside its configured records directory')
        info, _ = storage._verified_file(path, item['sha256'], capture=False)
        if not info.st_size:
            raise ValueError('Retained acceptance evidence is empty')
        purposes.add(item.get('purpose'))
    if not {'browser', 'recovery'} <= purposes:
        raise ValueError('Both browser and recovery evidence must remain available')


class Status:
    def __init__(self, live, records_root):
        self.live, self.root = Path(live).absolute(), Path(records_root).absolute()

    def cleanup(self, report, plan_path=None):
        for marker in ['DEPLOYMENT_IN_PROGRESS.json', '.DO_NOT_DEPLOY']:
            if (self.live / marker).exists() or (self.live / marker).is_symlink():
                report.update(status='unknown', reason='publication-in-progress-or-blocked')
                return
        receipt_path = self.live / 'RELEASE_ARTIFACTS.json'
        receipt_bytes = metadata_bytes(receipt_path, self.live)
        receipt = json.loads(receipt_bytes)
        if (receipt.get('deploymentStatus') != 'verified'
                or not all(retention.IMAGE.fullmatch(receipt.get('images', {}).get(c, ''))
                           for c in retention.COMPONENTS)):
            raise ValueError('The current receipt is not a verified website release')
        receipt_sha = retention.digest(receipt_bytes)
        report['currentReceipt'] = {'path': str(receipt_path), 'sha256': receipt_sha,
                                    'images': receipt['images']}
        operation_path = receipt.get('releaseOperationReceipt')
        if not operation_path:
            report.update(status='missing', reason='current-release-has-no-operation-receipt')
            return
        operation_bytes = metadata_bytes(operation_path, self.root)
        operation = json.loads(operation_bytes)
        plan_path = Path(plan_path) if plan_path else Path(operation_path).parent / 'retention-pending.json'
        report['plan'] = str(plan_path)
        if not plan_path.exists() and not plan_path.is_symlink():
            report.update(status='missing', reason='current-release-has-no-retention-plan')
            return
        plan_bytes = metadata_bytes(plan_path, self.root)
        plan = json.loads(plan_bytes)
        if (plan.get('schemaVersion') != 1 or not isinstance(plan.get('receiptSha256'), str)
                or not retention.DIGEST.fullmatch(plan['receiptSha256'])
                or not retention.SHA.fullmatch(plan.get('sourceCommit', ''))
                or not isinstance(plan.get('components'), list) or not plan['components']
                or not set(plan['components']) <= set(retention.COMPONENTS)):
            raise ValueError('Invalid retention plan')
        if plan['receiptSha256'] != receipt_sha:
            report.update(status='new-current', reason='plan-belongs-to-a-different-current-receipt')
            return
        if (plan.get('live') != str(self.live) or plan.get('operationReceipt') != operation_path
                or plan.get('previousReceipt') != receipt.get('previousReceipt')
                or operation.get('passed') is not True or operation.get('applied') is not True
                or operation.get('kind') != 'deploy' or operation.get('components') != plan.get('components')):
            raise ValueError('The retention plan does not belong to this successful deployment')
        previous_bytes = metadata_bytes(plan['previousReceipt'], self.root)
        if retention.digest(previous_bytes) != plan.get('previousReceiptSha256'):
            raise ValueError('Preserved previous receipt changed')
        plan_sha = retention.digest(plan_bytes)
        report['planSha256'] = plan_sha
        latest_path = plan_path.parent / 'retention-latest.json'
        if not latest_path.exists() and not latest_path.is_symlink():
            report.update(status='pending', reason='no-completed-closeout-record',
                          acceptancePresent=(plan_path.parent / 'acceptance.json').is_file())
            return
        latest = json.loads(metadata_bytes(latest_path, self.root))
        if latest.get('schemaVersion') != 1:
            raise ValueError('Invalid latest closeout state')
        if latest.get('receiptSha256') != receipt_sha or latest.get('observedReceiptSha256') != receipt_sha:
            report.update(status='new-current', reason='latest-closeout-does-not-belong-to-current-receipt')
            return
        if (latest.get('plan') != str(plan_path) or latest.get('planSha256') != plan_sha
                or latest.get('operationReceiptSha256') != retention.digest(operation_bytes)):
            raise ValueError('The latest closeout plan changed')
        acceptance_sha = latest.get('acceptanceSha256')
        acceptance = Path(latest['acceptance'])
        if acceptance_sha is None:
            if acceptance.exists() or acceptance.is_symlink():
                raise ValueError('Acceptance changed after the failed closeout')
        else:
            acceptance_bytes = metadata_bytes(acceptance, self.root)
            if retention.digest(acceptance_bytes) != acceptance_sha:
                raise ValueError('Acceptance changed after closeout')
        if latest.get('status') == 'pending':
            started_bytes = metadata_bytes(latest['closeoutStarted'], self.root)
            started = json.loads(started_bytes)
            if (retention.digest(started_bytes) != latest.get('closeoutStartedSha256')
                    or started.get('schemaVersion') != 1 or started.get('applied') is not True
                    or started.get('plan') != str(plan_path)
                    or started.get('acceptance') != str(acceptance)):
                raise ValueError('Unfinished closeout record changed or is unbound')
            report.update(status='pending', reason='closeout-started-without-final-state')
            return
        result_bytes = metadata_bytes(latest['closeoutResult'], self.root)
        result = json.loads(result_bytes)
        if (retention.digest(result_bytes) != latest.get('closeoutResultSha256')
                or result.get('schemaVersion') != 1 or result.get('applied') is not True
                or result.get('plan') != str(plan_path) or result.get('planSha256') != plan_sha
                or result.get('receiptSha256') != receipt_sha
                or result.get('observedReceiptSha256') != receipt_sha
                or result.get('acceptance') != str(acceptance)
                or result.get('acceptanceSha256') != acceptance_sha
                or result.get('operationReceiptSha256') != retention.digest(operation_bytes)
                or type(result.get('passed')) is not bool):
            raise ValueError('Closeout result is missing, changed or unbound')
        if result['passed']:
            historical_acceptance(json.loads(acceptance_bytes), plan, receipt, operation_bytes, self.root)
        removed = result.get('removed', [])
        if (not isinstance(removed, list)
                or not all(isinstance(i, str) and retention.IMAGE.fullmatch(i) for i in removed)
                or len(set(removed)) != len(removed)
                or result.get('deletedImageCount', 0) != len(removed)):
            raise ValueError('Invalid actual removal record')
        skipped = []
        if result.get('nativeResult'):
            native_bytes = metadata_bytes(result['nativeResult'], self.root)
            native = json.loads(native_bytes)
            if (retention.digest(native_bytes) != result.get('nativeResultSha256')
                    or native.get('applied') is not True or native.get('removed') != removed
                    or native.get('planSha256') != plan_sha
                    or native.get('acceptanceSha256') != acceptance_sha
                    or (result['passed'] and native.get('passed') is not True)):
                raise ValueError('Original removal result changed or is unbound')
            skipped = native.get('skipped', [])
        elif result['passed']:
            raise ValueError('Successful closeout requires the original removal result')
        status = ('cleaned' if removed else 'no-targets') if result['passed'] else 'failed'
        if status != latest.get('status'):
            raise ValueError('Latest state contradicts the actual closeout result')
        if retention.digest(metadata_bytes(receipt_path, self.live)) != receipt_sha:
            report.update(status='new-current', reason='current-receipt-changed-during-status-read')
            return
        report.update(status=status, reason='bound-completed-closeout', closeout={
            'path': latest['closeoutResult'], 'sha256': latest['closeoutResultSha256'],
            'finishedAt': result['finishedAt'], 'deletedImageCount': len(removed),
            'removed': removed, 'skipped': skipped,
            'freeBytesAtCloseout': result.get('freeBytesAfter'),
            'observedFreeBytesChange': result.get('observedFreeBytesChange'),
            'failureType': result.get('failureType') or result.get('nativeCaptureFailureType')
                           or result.get('latestStateFailureType'),
        })

    def read(self, plan=None, candidates=(), image_store=None, staging=None):
        report = {'schemaVersion': 1, 'checkedAt': retention.now().isoformat(),
                  'readOnly': True, 'deletionAuthorized': False, 'status': 'unknown'}
        try:
            space_path = storage._safe_absolute_path(self.live)
            report['space'] = {'path': str(space_path), 'device': space_path.stat().st_dev,
                               'availableBytes': shutil.disk_usage(space_path).free}
            self.cleanup(report, plan)
        except Exception as error:
            report.update(status='unknown', reason='missing-or-unverifiable-current-evidence',
                          failureType=type(error).__name__)
        if candidates:
            try:
                if not image_store or not staging:
                    raise ValueError('Candidate capacity requires the actual image store and staging directories')
                rows = [candidate_metadata(path, sha) for path, sha in candidates]
                report['capacity'] = storage.import_space(
                    rows, storage._safe_absolute_path(image_store), storage._safe_absolute_path(staging))
                report['capacity'].update(phase='before-transfer', externallyBoundCandidates=True,
                                          cleanupBytesSubtracted=False, layerReuseAssumed=False)
            except Exception as error:
                report['capacity'] = {'passed': False, 'failureType': type(error).__name__,
                                      'deletionAuthorized': False}
        report['needsAttention'] = (report['status'] not in {'cleaned', 'no-targets'}
                                    or bool(report.get('closeout', {}).get('skipped'))
                                    or report.get('capacity', {}).get('passed') is False)
        return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', type=Path, default=Path('/opt/website'))
    parser.add_argument('--records-root', type=Path, default=Path('/data/migration-rehearsals'))
    parser.add_argument('--plan', type=Path, help='Optional exact plan; an older plan is reported as new-current')
    parser.add_argument('--candidate', nargs=2, action='append', default=[], metavar=('PATH', 'SHA256'))
    parser.add_argument('--image-store', type=Path)
    parser.add_argument('--staging', type=Path)
    args = parser.parse_args()
    if (args.image_store or args.staging) and not args.candidate:
        parser.error('Image store and staging are used only with an externally bound candidate')
    report = Status(args.live, args.records_root).read(args.plan, args.candidate, args.image_store, args.staging)
    print(json.dumps(report))
    if args.candidate:
        return 0 if report['capacity']['passed'] else 75
    return 1 if report['status'] in {'unknown', 'new-current'} else 0


if __name__ == '__main__':
    raise SystemExit(main())
