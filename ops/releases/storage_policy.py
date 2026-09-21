#!/usr/bin/env python3
"""Capacity gate and evidence-based retention plan. Never deletes or deploys."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import shutil

GIB = 1024**3
DEPLOY_RESERVE = 5 * GIB
ROLLBACK_RESERVE = 2 * GIB
IMAGE = re.compile(r'^sha256:[0-9a-f]{64}$')
SYSTEMS = {'website', 'shuju', 'furnace'}
SOURCE_PATHS = {
    'shuju': re.compile(r'^/opt/shuju/releases/repo-before-[0-9a-f]{7,40}-[0-9]{8}T[0-9]{4,6}$'),
    'furnace': re.compile(r'^/opt/furnace-price-system/backups/repo_[0-9]{8}_[0-9]{6}$'),
}


def eligible_path(item):
    path, kind = item.get('path', ''), item.get('kind')
    if any(part in {'.', '..'} for part in path.split('/')):
        return False
    if kind == 'source-copy':
        pattern = SOURCE_PATHS.get(item.get('system'))
        return bool(pattern and pattern.fullmatch(path))
    if kind == 'restore-drill':
        return item.get('system') == 'website' and bool(re.fullmatch(
            r'/data/migration-backups/[0-9]{8}T[0-9]{6}Z-[0-9a-f]{8}/data-restore-drill', path))
    if kind == 'partial-transfer':
        return item.get('system') == 'website' and bool(re.fullmatch(
            r'/data/migration-rehearsals/[^/]+/[^/]+\.partial', path))
    return False


def positive_bytes(value, name):
    if type(value) is not int or value <= 0:
        raise ValueError(name + ' must be a positive integer')
    return value


def working_space(path, kind='deploy'):
    if kind not in {'deploy', 'rollback'}:
        raise ValueError('Unknown release kind')
    required = ROLLBACK_RESERVE if kind == 'rollback' else DEPLOY_RESERVE
    available = shutil.disk_usage(path).free
    result = {'availableBytes': available, 'requiredBytes': required,
              'kind': kind, 'passed': available >= required}
    if not result['passed']:
        raise RuntimeError(f'Insufficient working space: {available} bytes available, '
                           f'{required} required; review retention before releasing')
    return result


def import_space(candidates, store, staging):
    """Check BEFORE transfer/load, allowing for compressed and unpacked storage.

    Containerd may retain both forms. Reserving twice imageBytes is conservative;
    the staging archive is additional only on the filesystem that receives it.
    Current and rollback images are already on disk and are never subtracted.
    """
    if not candidates:
        raise ValueError('At least one candidate is required')
    identities = [c.get('imageTag') for c in candidates]
    if any(not isinstance(x, str) or not x for x in identities) or len(set(identities)) != len(identities):
        raise ValueError('Candidates must identify distinct images')
    image_bytes = sum(positive_bytes(c.get('imageBytes'), 'imageBytes') for c in candidates)
    archive_bytes = sum(positive_bytes(c.get('archiveBytes'), 'archiveBytes') for c in candidates)
    required = {}
    for path, added in [(Path(store), image_bytes * 2), (Path(staging), archive_bytes)]:
        device = path.stat().st_dev
        row = required.setdefault(device, {'path': str(path), 'requiredBytes': DEPLOY_RESERVE})
        row['requiredBytes'] += added
    filesystems = []
    for row in required.values():
        available = shutil.disk_usage(row['path']).free
        filesystems.append({**row, 'availableBytes': available,
                            'passed': available >= row['requiredBytes']})
    return {'passed': all(x['passed'] for x in filesystems), 'filesystems': filesystems,
            'imageBytes': image_bytes, 'archiveBytes': archive_bytes,
            'reserveBytes': DEPLOY_RESERVE, 'deletionAuthorized': False}


def retention_plan(evidence):
    """Classify a fresh, reviewed inventory without guessing recovery identity.

    Each component supplies its verified current and previous image. Source
    copies and drills require explicit existing verification evidence; dates,
    unused labels and aggregate directory sizes never establish redundancy.
    The resulting candidate list still requires fresh path/use/hash checks.
    """
    if evidence.get('schemaVersion') != 1 or not isinstance(evidence.get('objects'), list):
        raise ValueError('A versioned object inventory is required')
    try:
        collected = datetime.fromisoformat(evidence['collectedAt'].replace('Z', '+00:00'))
        age = (datetime.now(timezone.utc) - collected).total_seconds()
    except (KeyError, TypeError, ValueError, AttributeError) as error:
        raise ValueError('A timezone-aware inventory collection time is required') from error
    if not 0 <= age <= 24 * 60 * 60:
        raise ValueError('Refresh the inventory: it must be from the last 24 hours')
    boundaries = evidence.get('components', {})
    if not isinstance(boundaries, dict):
        raise ValueError('Component recovery boundaries must be an object')
    protected = set()
    valid_boundaries = {}
    for name, boundary in boundaries.items():
        if not isinstance(boundary, dict):
            continue
        current, previous = boundary.get('current'), boundary.get('previous')
        if (boundary.get('system') in SYSTEMS and boundary.get('verified') is True
                and all(isinstance(x, str) and IMAGE.fullmatch(x) for x in [current, previous])
                and current != previous):
            valid_boundaries[name] = boundary['system']
            protected.update([current, previous])
    rows = []
    identities = set()
    for item in evidence['objects']:
        identity = item.get('imageId') if item.get('kind') == 'image' else item.get('path')
        if not isinstance(identity, str) or not identity or identity in identities:
            raise ValueError('Every object must have a unique exact identity')
        identities.add(identity)
        classification, reason = 'retain', 'Verification is incomplete'
        component = item.get('component')
        kind = item.get('kind')
        if item.get('system') not in SYSTEMS:
            reason = 'Outside the managed systems'
        elif kind in {'database-backup', 'business-data', 'uploads', 'configuration', 'recovery-archive'}:
            reason = 'Production data and retained recovery material are protected'
        elif item.get('inUse') is not False or item.get('protected') is not False:
            reason = 'In use, protected, or usage has not been verified'
        elif valid_boundaries.get(component) != item.get('system'):
            reason = 'Current and previous recovery versions are not verified'
        elif kind == 'image' and (not IMAGE.fullmatch(identity) or identity in protected):
            reason = 'Current/previous image, or invalid immutable identity'
        elif kind not in {'image', 'source-copy', 'restore-drill', 'partial-transfer'}:
            reason = 'Unknown object kind'
        elif kind != 'image' and not eligible_path(item):
            reason = 'Path is outside the specific historical artifact locations'
        elif kind != 'image' and (item.get('isSymlink') is not False or item.get('ancestorsVerified') is not True):
            reason = 'Path and parent directories must be verified without symbolic links'
        elif item.get('stable') is not True or item.get('referencesClear') is not True:
            reason = 'Object stability and external references must be verified'
        elif kind == 'partial-transfer' and item.get('truncated') is True:
            classification, reason = 'candidate', 'Verified incomplete transfer without a live reference'
        elif item.get('recoveryVerified') is not True:
            reason = 'Retained recovery copy has not been verified'
        elif kind == 'restore-drill' and item.get('restorePassed') is not True:
            reason = 'Restore drill did not fully pass'
        elif kind == 'source-copy' and item.get('fullyCovered') is not True:
            reason = 'Unique or unverified source/configuration content remains'
        elif kind == 'partial-transfer':
            reason = 'A filename alone cannot prove an incomplete transfer'
        else:
            classification, reason = 'candidate', 'Outside current/previous boundary with verified recovery coverage'
        rows.append({'identity': identity, 'kind': kind, 'system': item.get('system'),
                     'classification': classification, 'reason': reason})
    return {'schemaVersion': 1, 'collectedAt': evidence['collectedAt'],
            'deletionAuthorized': False, 'executed': False,
            'policy': 'Keep current and previous verified versions; protect all business backups',
            'objects': rows, 'candidateCount': sum(r['classification'] == 'candidate' for r in rows)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    space = sub.add_parser('check-import')
    space.add_argument('--candidate', type=Path, action='append', required=True)
    space.add_argument('--image-store', type=Path, default=Path('/var/lib/containerd'))
    space.add_argument('--staging', type=Path, default=Path('/data/migration-rehearsals'))
    plan = sub.add_parser('plan')
    plan.add_argument('--evidence', type=Path, required=True)
    args = parser.parse_args()
    if args.command == 'check-import':
        result = import_space([json.loads(p.read_text()) for p in args.candidate], args.image_store, args.staging)
    else:
        result = retention_plan(json.loads(args.evidence.read_text()))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get('passed', True) else 75


if __name__ == '__main__':
    raise SystemExit(main())
