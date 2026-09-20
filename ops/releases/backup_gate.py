"""Verify the actual daily archives before an additive schema migration."""
import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess


def verify_daily_backup(directory=Path('/data/backup'), now=None):
    directory = Path(directory)
    report = json.loads((directory / 'last-status.json').read_text())
    now = now or datetime.datetime.now(datetime.timezone.utc)
    finished = datetime.datetime.fromisoformat(report['finishedAt'])
    age = (now - finished).total_seconds()
    if report.get('status') != 'ok' or not 0 <= age <= 26 * 3600:
        raise ValueError('A successful backup within 26 hours is required')
    database = report['database']['file']
    match = re.fullmatch(r'db-(\d{8}-\d{6})\.sql\.gz', database)
    if not match or report['database']['tables'] < 20 or report['uploads']['files'] < 0:
        raise ValueError('Invalid verified backup receipt')
    stamp = match[1]
    uploads = report['uploads']['file']
    if uploads != f'uploads-{stamp}.tar.gz':
        raise ValueError('Database and uploads must belong to the same backup')
    checksum_file = directory / f'backup-{stamp}.sha256'
    expected = {}
    for line in checksum_file.read_text().splitlines():
        digest, name = line.split()
        name = name.lstrip('*')
        if not re.fullmatch(r'[0-9a-f]{64}', digest) or name in expected:
            raise ValueError('Invalid backup checksum list')
        expected[name] = digest
    if set(expected) != {database, uploads}:
        raise ValueError('Unexpected backup archive membership')
    for name in expected:
        archive = directory / name
        if archive.is_symlink() or not archive.is_file():
            raise ValueError('Backup archive must be a regular local file')
        digest = hashlib.sha256()
        with archive.open('rb') as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                digest.update(block)
        if digest.hexdigest() != expected[name]:
            raise ValueError('Backup checksum mismatch')
        subprocess.run(['gzip', '-t', str(archive)], check=True, capture_output=True, timeout=60)
    return {'verified': True, 'finishedAt': report['finishedAt'], 'archives': expected,
            'restoreRehearsed': False, 'offsiteVerified': False}
