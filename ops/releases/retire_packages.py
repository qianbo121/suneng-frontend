#!/usr/bin/env python3
"""Recover capacity from exact historical transport packages with an independent verified copy."""
import argparse
from contextlib import ExitStack
import fcntl
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
from datetime import datetime, timezone

from storage_policy import DIGEST, _safe_absolute_path, _verified_file, _file_identity
from archive_identity import verify_archive

COMMIT = re.compile(r'[a-f0-9]{40}')
WEBSITE = re.compile(r'/data/migration-rehearsals/[A-Za-z0-9][A-Za-z0-9_.-]*/artifacts/frontend/frontend\.tar\.gz')
SHUJU = re.compile(r'/opt/shuju/releases/shuju-engine-([a-f0-9]{40})\.tar\.gz')
SUCCESS = re.compile(r'^SERVER_DEPLOY_OK commit=([a-f0-9]{40}) old=([a-f0-9]{40})(?: |$)', re.M)
LOCKS = ['/var/lock/corp-site-deploy.lock', '/var/lock/shuju-deploy.lock', '/var/run/shuju-backup.lock']


def used(path):
    # A positive match, missing tool, or an incomplete scan keeps the package.
    result = subprocess.run(['lsof', '-Fn', '--', str(path)], capture_output=True, text=True)
    if result.returncode not in (0, 1) or result.stderr.strip():
        raise RuntimeError('Unable to confirm whether the package is open')
    return bool(result.stdout.strip()) or result.returncode == 0


def website_versions(live=Path('/opt/website'), records=Path('/data/migration-rehearsals')):
    if (live / 'DEPLOYMENT_IN_PROGRESS.json').exists() or (live / '.DO_NOT_DEPLOY').exists():
        raise ValueError('Website release is active or blocked')
    path = _safe_absolute_path(live / 'RELEASE_ARTIFACTS.json')
    visited, approved, protected = set(), set(), set()
    while path not in visited:
        visited.add(path)
        row = json.loads(path.read_bytes())
        if row.get('deploymentStatus') != 'verified':
            break
        meta = row.get('frontendRelease') or {}
        commit, digest = meta.get('sourceCommit', ''), meta.get('archiveSha256', '')
        if not COMMIT.fullmatch(commit) or not DIGEST.fullmatch(digest):
            break
        if len(protected) < 2:
            protected.add(commit)
        approved.add((commit, digest))
        previous = row.get('previousReceipt')
        if not previous:
            break
        path = _safe_absolute_path(previous)
        if records not in path.parents:
            break
    if len(protected) != 2:
        raise ValueError('Two distinct verified website releases are required')
    return approved, protected


def shuju_versions(home=Path('/opt/shuju')):
    if (home / 'shared' / '.migration-started').exists():
        raise ValueError('Shuju migration is active')
    accepted = []
    for path in sorted((home / 'release-backups').glob('deploy-*.log'), key=lambda p: p.stat().st_mtime_ns):
        matches = SUCCESS.findall(_safe_absolute_path(path).read_text(errors='replace'))
        if len(matches) == 1:
            accepted.append(matches[0])
    current = (home / 'shared' / 'DEPLOY_COMMIT').read_text().strip()
    if not accepted or accepted[-1][0] != current or current == accepted[-1][1]:
        raise ValueError('Running Shuju release does not match its recovery boundary')
    return {new for new, _ in accepted}, set(accepted[-1])


def confirmed_package(row, path, versions):
    commit, digest = row['sourceCommit'], row['sha256']
    if not isinstance(commit, str) or not COMMIT.fullmatch(commit):
        return False
    if SHUJU.fullmatch(str(path)):
        allowed, protected = versions['shuju']
        return SHUJU.fullmatch(str(path))[1] == commit and commit in allowed and commit not in protected
    if WEBSITE.fullmatch(str(path)):
        allowed, protected = versions['website']
        if (commit, digest) not in allowed or commit in protected:
            return False
        manifest = _safe_absolute_path(path.with_name('candidate.json')).read_bytes()
        value = json.loads(manifest)
        if value.get('sourceCommit') != commit or value.get('archiveSha256') != digest:
            return False
        return verify_archive(manifest, path, candidate_sha256=row['candidateSha256'])['passed']
    return False


def retire(rows, archive_root, free_target, apply, versions, *,
           eligible=confirmed_package, in_use=used, disk_usage=shutil.disk_usage):
    if type(free_target) is not int or free_target < 1:
        raise ValueError('A positive free-space target in bytes is required')
    archive_root = _safe_absolute_path(archive_root)
    if not archive_root.is_dir():
        raise ValueError('Independent archive is unavailable')
    rows = sorted(rows, key=lambda row: _safe_absolute_path(row['path']).stat().st_mtime_ns)
    recovered = {}
    result = []
    for row in rows:
        path = _safe_absolute_path(row['path'])
        if not eligible(row, path, versions):
            continue
        info = path.stat()
        free = disk_usage(path).free
        pending = recovered.get(info.st_dev, 0) if not apply else 0
        if free + pending >= free_target or in_use(path):
            continue
        other = _safe_absolute_path(row['archiveCopy'])
        if archive_root not in other.parents or other.stat().st_dev == info.st_dev:
            raise ValueError('Archive copy must be on an independent filesystem')
        saved, _ = _verified_file(other, row['sha256'], info.st_size)
        checked, _ = _verified_file(path, row['sha256'], info.st_size)
        if (_file_identity(checked) != _file_identity(info) or
                _file_identity(other.stat()) != _file_identity(saved)):
            raise ValueError('Source or independent copy changed')
        if in_use(path):
            continue
        if apply:
            directory = os.open(_safe_absolute_path(path.parent), os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
            try:
                current = os.stat(path.name, dir_fd=directory, follow_symlinks=False)
                copy = _safe_absolute_path(other).stat()
                if (_file_identity(current) != _file_identity(checked) or
                        _file_identity(copy) != _file_identity(saved)):
                    raise ValueError('Verified files changed before retirement')
                os.unlink(path.name, dir_fd=directory)
                os.fsync(directory)
            finally:
                os.close(directory)
        recovered[info.st_dev] = pending + checked.st_blocks * 512
        result.append({'path': str(path), 'sha256': row['sha256'], 'allocatedBytes': checked.st_blocks * 512,
                       'independentCopy': str(other), 'removed': apply,
                       'availableAfter': disk_usage(path.parent).free})
        if apply:
            print(json.dumps(result[-1]), flush=True)
    return result


def run_inventory(inventory_path, trusted_sha256, apply=False):
    _, raw = _verified_file(inventory_path, trusted_sha256, capture=True)
    inventory = json.loads(raw)
    if inventory.get('schemaVersion') != 1:
        raise ValueError('Unsupported package inventory')
    archive_root = Path(inventory['archiveRoot'])
    target = inventory['targetFreeBytes']
    age = (datetime.now(timezone.utc) - datetime.fromisoformat(inventory['collectedAt'].replace('Z', '+00:00'))).total_seconds()
    if not 0 <= age <= 86400 or os.geteuid() != 0:
        raise ValueError('Current inventory and full process visibility on the host are required')
    rows = inventory['packages']
    if len({row['path'] for row in rows}) != len(rows):
        raise ValueError('Duplicate inventory path')
    with ExitStack() as stack:
        for name in LOCKS:
            lock = stack.enter_context(open(name, 'rb'))
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        # An already retired package is an idempotent skip.
        remaining = [row for row in rows
                     if (SHUJU.fullmatch(row['path']) or WEBSITE.fullmatch(row['path']))
                     and _safe_absolute_path(row['path']).exists()]
        versions = {}
        if any(WEBSITE.fullmatch(row['path']) for row in remaining):
            versions['website'] = website_versions()
        if any(SHUJU.fullmatch(row['path']) for row in remaining):
            versions['shuju'] = shuju_versions()
        result = retire(remaining, archive_root, target, apply, versions)
        return {'apply': apply, 'inventorySha256': trusted_sha256, 'packages': result}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory', type=Path, required=True)
    parser.add_argument('--inventory-sha256', required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    print(json.dumps(run_inventory(args.inventory, args.inventory_sha256, args.apply)))
