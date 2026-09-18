#!/usr/bin/env python3
"""Capture site data and restore only into an isolated, owned drill container."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts' / 'geo-migration'))
import backup_rehearsal as b


def capture(identifier):
    destination = b.batch_path(identifier)
    if shutil.disk_usage(b.ROOT).free < 2560 * 1024**2:
        raise RuntimeError('Data backup requires 2.5 GiB free working space')
    b.PARENT.mkdir(mode=0o700, exist_ok=True)
    destination.mkdir(mode=0o700)
    report = {'id': identifier, 'status': 'incomplete', 'kind': 'data-only',
              'started_at': b.now(), 'production_written': False, 'offsite_verified': False}
    b.save_json(destination / 'data-manifest.json', report)
    with open('/var/lock/corp-site-deploy.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_SH | fcntl.LOCK_NB)
        before = b.state()
        b.verify_production(before)
        report['production_before'] = before
        uploads = b.file_manifest(b.UPLOADS)
        snapshot = b.Snapshot('corp-site-postgres')
        try:
            report['database_tables'] = b.table_fingerprints(snapshot.query)
            with (destination / 'database.dump').open('xb') as stream:
                b.run(['docker', 'exec', 'corp-site-postgres', 'pg_dump', '-U', 'corporate', '-d', 'corporate_site', '--format=custom', '--no-password', '--snapshot=' + snapshot.token], stdout=stream)
        finally:
            snapshot.close()
        b.run(['tar', '-czf', str(destination / 'uploads.tar.gz'), '-C', str(b.UPLOADS.parent), b.UPLOADS.name])
        if uploads != b.file_manifest(b.UPLOADS):
            raise RuntimeError('Uploads changed during capture; use a fresh batch')
        if not b.same_state(before, b.state()):
            raise RuntimeError('Production changed during capture')
        report.update({'uploads': uploads, 'status': 'backup_complete', 'finished_at': b.now(), 'production_unchanged': True,
                       'artifacts': [{'name': name, 'bytes': (destination / name).stat().st_size, 'sha256': b.sha(destination / name)} for name in ['database.dump', 'uploads.tar.gz']]})
        b.save_json(destination / 'data-manifest.json', report)
    return {'id': identifier, 'status': 'backup_complete', 'production_written': False}


def validate_data_manifest(manifest, identifier):
    if manifest.get('id') != b.valid_id(identifier) or manifest.get('kind') != 'data-only' or manifest.get('status') != 'backup_complete':
        raise ValueError('Only a complete matching data backup can be rehearsed')
    if sorted(x['name'] for x in manifest.get('artifacts', [])) != ['database.dump', 'uploads.tar.gz']:
        raise ValueError('Unexpected data archive membership')


def restore(identifier):
    destination = b.batch_path(identifier)
    manifest = json.loads((destination / 'data-manifest.json').read_text())
    validate_data_manifest(manifest, identifier)
    b.verify_artifacts(destination, manifest)
    b.validate_upload_archive(destination / 'uploads.tar.gz')
    work = destination / 'data-restore-drill'
    work.mkdir(mode=0o700)
    b.run(['tar', '-xzf', str(destination / 'uploads.tar.gz'), '-C', str(work)])
    if b.file_manifest(work / 'uploads') != manifest['uploads']:
        raise RuntimeError('Restored attachments differ from captured files')
    database_dir = work / 'postgres'
    database_dir.mkdir(mode=0o700)
    report = {'id': identifier, 'status': 'incomplete', 'started_at': b.now(),
              'database_identical': False, 'uploads_identical': True, 'offsite_verified': False,
              'isolation': {'network': 'none', 'published_ports': [], 'production_mounts': []}}
    image = next(x['image'] for x in manifest['production_before'] if x['name'] == 'corp-site-postgres')
    name = 'suneng-geo-drill-' + identifier
    with open('/var/lock/corp-site-deploy.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_SH | fcntl.LOCK_NB)
        before = b.state()
        b.verify_production(before)
        started = False
        try:
            b.run(b.drill_container_args(image, identifier, database_dir), stdout=subprocess.PIPE)
            started = True
            for _ in range(60):
                probe = subprocess.run(['docker', 'exec', name, 'pg_isready', '-U', 'corporate', '-d', 'corporate_site'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                if probe.returncode == 0:
                    break
                time.sleep(1)
            else:
                raise RuntimeError('Isolated database did not become ready')
            with (destination / 'database.dump').open('rb') as stream:
                b.run(['docker', 'exec', '-i', name, 'pg_restore', '--exit-on-error', '--no-owner', '--no-privileges', '-U', 'corporate', '-d', 'corporate_site'], stdin=stream, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            query = lambda sql: b.output(['docker', 'exec', name, 'psql', '-XqAt', '-v', 'ON_ERROR_STOP=1', '-U', 'corporate', '-d', 'corporate_site', '-c', sql])
            if b.table_fingerprints(query) != manifest['database_tables']:
                raise RuntimeError('Restored database differs from captured snapshot')
            report.update({'database_identical': True, 'tables': len(manifest['database_tables']), 'upload_files': len(manifest['uploads']), 'status': 'restore_passed'})
        finally:
            if started:
                b.remove_owned_container(name, identifier)
            report.update({'finished_at': b.now(), 'drill_container_removed': started, 'production_unchanged': b.same_state(before, b.state())})
            if not report['production_unchanged']:
                report['status'] = 'failed'
            b.save_json(destination / 'data-restore-report.json', report)
    if report['status'] != 'restore_passed':
        raise RuntimeError('Data recovery rehearsal failed')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['capture', 'restore'])
    parser.add_argument('--id', required=True, type=b.valid_id)
    args = parser.parse_args()
    os.umask(0o077)
    if not b.ROOT.is_dir() or not b.UPLOADS.is_dir():
        raise SystemExit('Run only on the inventoried website host')
    print(json.dumps(capture(args.id) if args.action == 'capture' else restore(args.id)))


if __name__ == '__main__':
    main()
