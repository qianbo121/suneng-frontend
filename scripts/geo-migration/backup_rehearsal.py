#!/usr/bin/env python3
"""Private migration backup and isolated PostgreSQL restore; never restores production.

Run on the existing website host through SSH. Commands are constrained to the
observed website paths and named website containers. Archives contain private
production data/configuration and must stay outside Git and public document roots.
"""
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tarfile
import time
from datetime import datetime, timezone

ROOT = Path('/opt/website')
UPLOADS = Path('/data/uploads')
PARENT = Path('/data/migration-backups')
PRODUCTION = ['corp-site-postgres', 'corp-site-backend', 'corp-site-admin', 'corp-site-frontend', 'corp-site-nginx']
LABEL = 'cn.jssngyl.migration-rehearsal'


def now():
    return datetime.now(timezone.utc).isoformat()


def run(args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)


def output(args):
    return subprocess.check_output(args, text=True).strip()


def save_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    path.chmod(0o600)


def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def file_manifest(root):
    result = []
    for p in sorted(root.rglob('*')):
        if p.is_symlink():
            raise RuntimeError('Symlink in uploads is not supported: ' + str(p.relative_to(root)))
        if p.is_file():
            result.append({'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size, 'sha256': sha(p)})
    return result


def valid_id(value):
    if not re.fullmatch(r'\d{8}T\d{6}Z-[a-f0-9]{8}', value):
        raise ValueError('Invalid migration batch identifier')
    return value


def batch_path(identifier):
    valid_id(identifier)
    if PARENT.is_symlink():
        raise ValueError('Backup parent must not be a symlink')
    path = PARENT / identifier
    if path.is_symlink() or path.resolve().parent != PARENT.resolve():
        raise ValueError('Unsafe backup path')
    return path


def state():
    # Never return environment variables in the public manifest.
    records = json.loads(output(['docker', 'inspect', *PRODUCTION]))
    return [{'name': d['Name'].lstrip('/'), 'image': d['Image'],
             'started_at': d['State']['StartedAt'], 'running': d['State']['Running'],
             'health': d['State'].get('Health', {}).get('Status'),
             'revision': (d['Config'].get('Labels') or {}).get('org.opencontainers.image.revision'),
             'mounts': [{'source': m['Source'], 'destination': m['Destination'], 'rw': m['RW']} for m in d['Mounts']]}
            for d in records]


def normalized_state(records):
    return sorted([{**row, 'mounts': sorted(row['mounts'], key=lambda x: (x['destination'], x['source']))} for row in records], key=lambda x: x['name'])


def same_state(left, right):
    return normalized_state(left) == normalized_state(right)


def verify_production(records):
    by_name = {x['name']: x for x in records}
    expected = [('corp-site-postgres', '/data/postgres', '/var/lib/postgresql/data'),
                ('corp-site-backend', '/data/uploads', '/app/uploads'),
                ('corp-site-nginx', '/data/uploads', '/var/www/uploads')]
    for name, source, destination in expected:
        if not any(x['source'] == source and x['destination'] == destination for x in by_name[name]['mounts']):
            raise RuntimeError('Production mount changed; re-inventory before backup')
    if not all(x['running'] for x in records):
        raise RuntimeError('A production container is not running')


class Snapshot:
    """Keep a read-only exported transaction alive through dump and fingerprints."""
    def __init__(self, container):
        self.process = subprocess.Popen(['docker', 'exec', '-i', container, 'psql', '-XqAt', '-v', 'ON_ERROR_STOP=1', '-U', 'corporate', '-d', 'corporate_site'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        self.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;', result=False)
        self.token = self.query('SELECT pg_export_snapshot();')

    def query(self, sql, result=True):
        self.process.stdin.write(sql + '\n')
        self.process.stdin.flush()
        if result:
            line = self.process.stdout.readline()
            if not line:
                raise RuntimeError('Snapshot session ended unexpectedly')
            return line.strip()

    def close(self):
        self.query('ROLLBACK;', result=False)
        self.process.stdin.close()
        self.process.wait(timeout=15)
        if self.process.returncode:
            raise RuntimeError('Read-only snapshot session failed')


def quote_identifier(s):
    return '"' + s.replace('"', '""') + '"'


def table_fingerprints(query):
    tables = json.loads(query("SELECT coalesce(json_agg(tablename ORDER BY tablename),'[]'::json) FROM pg_tables WHERE schemaname='public';"))
    rows = []
    for name in tables:
        value = json.loads(query("SELECT json_build_object('rows', count(*), 'content_md5', md5(coalesce(string_agg(md5(to_jsonb(t)::text), '' ORDER BY md5(to_jsonb(t)::text)), ''))) FROM public." + quote_identifier(name) + ' t;'))
        rows.append({'table': name, **value})
    return rows


def backup(identifier):
    destination = batch_path(identifier)
    PARENT.mkdir(mode=0o700, exist_ok=True)
    PARENT.chmod(0o700)
    destination.mkdir(mode=0o700)  # never overwrite an existing batch
    report = {'id': identifier, 'started_at': now(), 'status': 'incomplete', 'production_written': False,
              'consistency': 'Exported read-only PostgreSQL snapshot; upload hashes checked before and after; no writer freeze.'}
    save_json(destination / 'manifest.json', report)
    # Shared nonblocking lock: abort if a deployment is already changing the code.
    with open('/var/lock/corp-site-deploy.lock', 'r') as lock:
        fcntl.flock(lock, fcntl.LOCK_SH | fcntl.LOCK_NB)
        before = state()
        verify_production(before)
        report['production_before'] = before
        report['release_marker'] = (ROOT / 'DEPLOY_COMMIT').read_text().strip()
        report['postgres_version'] = output(['docker', 'exec', 'corp-site-postgres', 'postgres', '--version'])
        uploads_before = file_manifest(UPLOADS)
        snapshot = Snapshot('corp-site-postgres')
        try:
            report['database_tables'] = table_fingerprints(snapshot.query)
            with (destination / 'database.dump').open('xb') as dump:
                run(['docker', 'exec', 'corp-site-postgres', 'pg_dump', '-U', 'corporate', '-d', 'corporate_site', '--format=custom', '--no-password', '--snapshot=' + snapshot.token], stdout=dump)
        finally:
            snapshot.close()
        print('Database snapshot exported', flush=True)
        run(['tar', '-czf', str(destination / 'uploads.tar.gz'), '-C', '/data', 'uploads'])
        uploads_after = file_manifest(UPLOADS)
        report['uploads_stable_during_capture'] = uploads_before == uploads_after
        report['uploads'] = uploads_before
        if uploads_before != uploads_after:
            save_json(destination / 'manifest.json', report)
            raise RuntimeError('Uploads changed during capture; batch remains incomplete')
        excludes = ['--exclude=./backups', '--exclude=./.git', '--exclude=./node_modules', '--exclude=./frontend/node_modules', '--exclude=./backend/node_modules', '--exclude=./admin/node_modules', '--exclude=./frontend/.next*']
        run(['tar', *excludes, '-czf', str(destination / 'website-source-and-config.tar.gz'), '-C', str(ROOT), '.'])
        run(['tar', '-czf', str(destination / 'tls-config.tar.gz'), '-C', '/etc/nginx', 'certs'])
        with (destination / 'active-nginx.conf').open('xb') as f:
            run(['docker', 'exec', 'corp-site-nginx', 'nginx', '-T'], stdout=f, stderr=subprocess.PIPE)
        # Full inspect is deliberately private; public manifest above is redacted.
        with (destination / 'private-container-inspect.json').open('xb') as f:
            run(['docker', 'inspect', *PRODUCTION], stdout=f)
        image_ids = sorted({x['image'] for x in before})
        with (destination / 'running-images.tar.gz').open('xb') as f:
            producer = subprocess.Popen(['docker', 'image', 'save', *image_ids], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            try:
                run(['nice', '-n', '10', 'gzip', '-1'], stdin=producer.stdout, stdout=f)
            finally:
                producer.stdout.close()
            if producer.wait(timeout=60):
                raise RuntimeError('Saving the existing images failed')
        print('Uploads, code, private configuration and five running images archived', flush=True)
        after = state()
        report['production_after'] = after
        report['production_unchanged'] = same_state(before, after)
        if not same_state(before, after):
            save_json(destination / 'manifest.json', report)
            raise RuntimeError('Production container state changed during capture')
        report['artifacts'] = [{'name': p.name, 'bytes': p.stat().st_size, 'sha256': sha(p)} for p in sorted(destination.iterdir()) if p.is_file() and p.name != 'manifest.json']
        report['status'] = 'backup_complete'
        report['finished_at'] = now()
        save_json(destination / 'manifest.json', report)
        print(json.dumps({'status': report['status'], 'path': str(destination), 'tables': len(report['database_tables']), 'upload_files': len(uploads_before)}), flush=True)


def validate_upload_archive(archive):
    with tarfile.open(archive, 'r:gz') as tar:
        for item in tar.getmembers():
            path = PurePosixPath(item.name)
            if path.is_absolute() or '..' in path.parts or not path.parts or path.parts[0] != 'uploads' or not (item.isfile() or item.isdir()):
                raise ValueError('Unsafe upload archive member: ' + item.name)


def verify_artifacts(destination, manifest):
    for entry in manifest['artifacts']:
        name = entry['name']
        if Path(name).name != name:
            raise ValueError('Artifact name must be a basename')
        p = destination / name
        if p.is_symlink() or p.stat().st_size != entry['bytes'] or sha(p) != entry['sha256']:
            raise RuntimeError('Backup artifact changed: ' + name)


def remove_owned_container(name, identifier):
    if name != 'suneng-geo-drill-' + valid_id(identifier):
        raise ValueError('Refusing to touch a non-drill container')
    data = json.loads(output(['docker', 'inspect', name]))[0]
    if (data['Config'].get('Labels') or {}).get(LABEL) != identifier or data['HostConfig']['NetworkMode'] != 'none':
        raise ValueError('Drill container ownership/isolation check failed')
    run(['docker', 'rm', '-f', name], stdout=subprocess.PIPE)


def verify_image_archive(archive, expected_ids):
    """Validate actual runtime image identities and referenced blobs, including OCI indexes."""
    names, documents, blob_checks = set(), {}, {}
    with tarfile.open(archive, 'r|*') as tar:
        for member in tar:
            if not member.isfile():
                continue
            names.add(member.name)
            data = tar.extractfile(member)
            digest = hashlib.sha256()
            small = bytearray()
            for chunk in iter(lambda: data.read(1024 * 1024), b''):
                digest.update(chunk)
                if member.size <= 1024 * 1024:
                    small.extend(chunk)
            if member.name.startswith('blobs/sha256/'):
                if digest.hexdigest() != PurePosixPath(member.name).name:
                    raise RuntimeError('Image archive blob digest mismatch')
                blob_checks[member.name] = True
            if member.size <= 1024 * 1024:
                try:
                    documents[member.name] = json.loads(small)
                except (ValueError, UnicodeDecodeError):
                    pass
    if 'index.json' in documents:
        identities = {x['digest'] for x in documents['index.json']['manifests']}
        visited, config_identities = set(), set()
        def visit(digest, kind='image'):
            if not re.fullmatch(r'sha256:[0-9a-f]{64}', digest):
                raise RuntimeError('Unsupported image digest')
            key = 'blobs/sha256/' + digest.split(':', 1)[1]
            if key not in names or key not in blob_checks:
                raise RuntimeError('Runtime image blob missing')
            marker = (key, kind)
            if marker in visited:
                return
            visited.add(marker)
            document = documents.get(key)
            if kind == 'layer':
                return
            if kind == 'config':
                if not isinstance(document, dict) or document.get('os') != 'linux' or document.get('architecture') != 'amd64':
                    raise RuntimeError('Image configuration is not the production platform')
                config_identities.add(digest)
                return
            if isinstance(document, dict) and 'manifests' in document:
                children = [x for x in document['manifests'] if x.get('platform', {}).get('os') == 'linux' and x.get('platform', {}).get('architecture') == 'amd64']
                if not children:
                    raise RuntimeError('Archived image lacks the production platform')
                for child in children:
                    visit(child['digest'])
            elif isinstance(document, dict) and 'config' in document and 'layers' in document:
                visit(document['config']['digest'], 'config')
                for layer in document['layers']:
                    visit(layer['digest'], 'layer')
            else:
                raise RuntimeError('Invalid image manifest or index')
        # Containerd reports the top-level index/manifest identity; Docker's
        # classic image store reports the config identity. Traverse every root
        # first, so accepting the latter never skips layers or extra images.
        for identity in identities:
            visit(identity)
        if expected_ids == config_identities:
            identities = config_identities
    else:
        docker_manifest = documents.get('manifest.json', [])
        identities = {'sha256:' + PurePosixPath(x['Config']).stem for x in docker_manifest}
        for entry in docker_manifest:
            if entry['Config'] not in names or any(layer not in names for layer in entry['Layers']):
                raise RuntimeError('Legacy Docker archive lacks config/layers')
    if identities != expected_ids:
        raise RuntimeError('Running image identity set differs from archive')
    return {'identical': True, 'image_count': len(identities), 'format': 'OCI index' if 'index.json' in documents else 'Docker manifest', 'verified_blob_count': len(blob_checks), 'platform': 'linux/amd64'}


def verify_completed_drill(identifier):
    destination = batch_path(identifier)
    manifest = json.loads((destination / 'manifest.json').read_text())
    restored = json.loads((destination / 'restore-report.json').read_text())
    if manifest.get('status') != 'backup_complete' or not restored.get('database_identical') or not restored.get('uploads_identical') or not restored.get('drill_container_removed'):
        raise ValueError('A completed database/upload restore is required before archive verification')
    verify_artifacts(destination, manifest)
    image_check = verify_image_archive(destination / 'running-images.tar.gz', {x['image'] for x in manifest['production_before']})
    with tarfile.open(destination / 'website-source-and-config.tar.gz', 'r:gz') as tar:
        names = set(tar.getnames())
        source_check = all(x in names for x in ['./.env.production', './docker-compose.prod.yml', './DEPLOY_COMMIT', './deploy.sh'])
    if not source_check:
        raise RuntimeError('Required source/configuration files are missing')
    current = state()
    verify_production(current)
    unchanged = same_state(manifest['production_before'], current)
    if not unchanged:
        raise RuntimeError('Production version, health, start time or mounts changed')
    result = {'id': identifier, 'verified_at': now(), 'status': 'rehearsal_verified', 'database_identical': True, 'uploads_identical': True, 'image_archive': image_check, 'source_config_preserved': True, 'production_unchanged': True,
              'database_restore_evidence': 'restore-report-attempt-' + str(restored['attempt']) + '.json', 'previous_attempts_retained': True,
              'identity_note': 'OCI image index identities verified; mount order normalized without dropping mount properties.'}
    save_json(destination / 'archive-verification.json', result)
    print(json.dumps(result), flush=True)


def drill_container_args(image, identifier, database_dir):
    expected_parent = batch_path(identifier).resolve()
    if database_dir.resolve().parent.parent != expected_parent or database_dir.name != 'postgres':
        raise ValueError('Drill storage must stay in its private batch directory')
    return ['docker', 'run', '-d', '--name', 'suneng-geo-drill-' + identifier,
            '--label', LABEL + '=' + identifier, '--network', 'none', '--memory', '384m',
            '--cpus', '0.5', '--pids-limit', '128',
            '--mount', 'type=bind,src=' + str(database_dir) + ',dst=/var/lib/postgresql/data',
            '--env', 'PGDATA=/var/lib/postgresql/data', '--env', 'POSTGRES_HOST_AUTH_METHOD=trust',
            '--env', 'POSTGRES_USER=corporate', '--env', 'POSTGRES_DB=corporate_site', image]


def drill(identifier, attempt=1):
    destination = batch_path(identifier)
    manifest = json.loads((destination / 'manifest.json').read_text())
    if manifest.get('id') != identifier or manifest.get('status') != 'backup_complete':
        raise ValueError('Only a complete matching backup can be rehearsed')
    verify_artifacts(destination, manifest)
    before = state()
    verify_production(before)
    if attempt not in (1, 2):
        raise ValueError('Use a new review after two attempts')
    work = destination / ('restore-drill' if attempt == 1 else 'restore-drill-2')
    work.mkdir(mode=0o700)  # retain results; never reuse or overwrite
    validate_upload_archive(destination / 'uploads.tar.gz')
    run(['tar', '-xzf', str(destination / 'uploads.tar.gz'), '-C', str(work)])
    uploads = file_manifest(work / 'uploads')
    if uploads != manifest['uploads']:
        raise RuntimeError('Restored upload files do not match backup manifest')
    image = next(x['image'] for x in manifest['production_before'] if x['name'] == 'corp-site-postgres')
    name = 'suneng-geo-drill-' + identifier
    report = {'id': identifier, 'attempt': attempt, 'started_at': now(), 'status': 'incomplete', 'uploads_identical': True,
              'isolation': {'network': 'none', 'published_ports': [], 'memory': '384m', 'cpus': '0.5', 'production_mounts': []}}
    save_json(destination / 'restore-report.json', report)
    database_dir = work / 'postgres'
    database_dir.mkdir(mode=0o700)
    started = False
    try:
        run(drill_container_args(image, identifier, database_dir), stdout=subprocess.PIPE)
        started = True
        for attempt in range(60):
            probe = subprocess.run(['docker', 'exec', name, 'pg_isready', '-U', 'corporate', '-d', 'corporate_site'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if probe.returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError('Isolated PostgreSQL did not become ready')
        with (destination / 'database.dump').open('rb') as f:
            run(['docker', 'exec', '-i', name, 'pg_restore', '--exit-on-error', '--no-owner', '--no-privileges', '-U', 'corporate', '-d', 'corporate_site'], stdin=f, stdout=subprocess.PIPE)
        query = lambda sql: output(['docker', 'exec', name, 'psql', '-XqAt', '-v', 'ON_ERROR_STOP=1', '-U', 'corporate', '-d', 'corporate_site', '-c', sql])
        restored = table_fingerprints(query)
        report['database_tables'] = restored
        report['database_identical'] = restored == manifest['database_tables']
        report['restored_database_bytes'] = int(query('SELECT pg_database_size(current_database());'))
        if not report['database_identical']:
            raise RuntimeError('Restored database differs from the exported snapshot')
        # Source/image archives are validated as archives; no production load/restart.
        image_check = verify_image_archive(destination / 'running-images.tar.gz', {x['image'] for x in manifest['production_before']})
        report['running_image_ids_preserved'] = image_check['identical']
        with tarfile.open(destination / 'website-source-and-config.tar.gz', 'r:gz') as tar:
            names = set(tar.getnames())
            report['source_config_core_files_preserved'] = all(x in names for x in ['./.env.production', './docker-compose.prod.yml', './DEPLOY_COMMIT', './deploy.sh'])
        if not report['source_config_core_files_preserved']:
            raise RuntimeError('Source/configuration archive lacks required files')
        report['status'] = 'restore_passed'
    except Exception as error:
        report['error'] = str(error)
        if started:
            with (destination / ('drill-attempt-' + str(attempt) + '.log')).open('wb') as log:
                subprocess.run(['docker', 'logs', name], stdout=log, stderr=subprocess.STDOUT)
        raise
    finally:
        if started:
            remove_owned_container(name, identifier)
        report['production_unchanged'] = same_state(before, state())
        report['drill_container_removed'] = started
        report['finished_at'] = now()
        save_json(destination / ('restore-report-attempt-' + str(attempt) + '.json'), report)
        save_json(destination / 'restore-report.json', report)
    if not report['production_unchanged']:
        raise RuntimeError('Production changed during the rehearsal')
    print(json.dumps({'status': report['status'], 'tables': len(report['database_tables']), 'upload_files': len(uploads), 'production_unchanged': report['production_unchanged']}), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['backup', 'drill', 'verify'])
    parser.add_argument('--id', required=True, type=valid_id)
    parser.add_argument('--attempt', type=int, choices=[1, 2], default=1)
    args = parser.parse_args()
    os.umask(0o077)
    if not ROOT.is_dir() or not UPLOADS.is_dir():
        raise SystemExit('Run only on the inventoried website host')
    if args.action == 'backup':
        backup(args.id)
    elif args.action == 'drill':
        drill(args.id, args.attempt)
    else:
        verify_completed_drill(args.id)


if __name__ == '__main__':
    main()
