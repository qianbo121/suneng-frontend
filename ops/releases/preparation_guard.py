"""Frozen preparation evidence and strict transaction protection for shared hosts."""
import copy
import hashlib
import json
from pathlib import Path
import stat

from phase_runtime import digest, exclusive_json, now

LIVE_FILES = ('RELEASE_ARTIFACTS.json', 'verified-images.override.yml', 'DEPLOY_COMMIT',
              '.env.production', 'docker-compose.prod.yml', 'nginx.prod.conf.template',
              '.DO_NOT_DEPLOY', 'DEPLOYMENT_IN_PROGRESS.json')
OWN_FILES = {'RELEASE_ARTIFACTS.json', 'verified-images.override.yml', 'DEPLOY_COMMIT',
             'DEPLOYMENT_IN_PROGRESS.json'}


class ProtectionChanged(RuntimeError):
    failure_category = 'protection-change'


class InvalidBaseline(ValueError):
    failure_category = 'invalid-baseline'


def file_identity(path):
    path = Path(path)
    if path.is_symlink() or any(parent.is_symlink() for parent in path.parents):
        raise ProtectionChanged('Protected file has an unsafe path')
    if not path.exists():
        return None
    info = path.stat()
    if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
        raise ProtectionChanged('Protected file must be a regular, unshared file')
    content = path.read_bytes()
    after = path.stat()
    if (info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns):
        raise ProtectionChanged('Protected file changed while reading')
    return {'sha256': hashlib.sha256(content).hexdigest(), 'mode': stat.S_IMODE(info.st_mode)}


def container_identity(row):
    state = row['State']
    config = row.get('Config') or {}
    return {'id': row['Id'], 'image': row['Image'], 'startedAt': state['StartedAt'],
            'running': state['Running'], 'paused': state.get('Paused', False),
            'restarting': state.get('Restarting', False), 'dead': state.get('Dead', False),
            'status': state.get('Status', 'running' if state['Running'] else 'stopped'),
            'health': (state.get('Health') or {}).get('Status'),
            'source': (config.get('Labels') or {}).get('org.opencontainers.image.revision'),
            # Persist digests only, never container environment or configuration values.
            'configSha256': digest({'Config': config, 'HostConfig': row.get('HostConfig'), 'Mounts': row.get('Mounts')})}


def snapshot(live, command, extra_files=()):
    live = Path(live)
    ids = command(['docker', 'ps', '-q']).split()
    rows = json.loads(command(['docker', 'inspect', *ids])) if ids else []
    if set(ids) != set(command(['docker', 'ps', '-q']).split()):
        raise ProtectionChanged('Container inventory changed while reading')
    containers = {row['Name']: container_identity(row) for row in rows}
    if len(containers) != len(rows) or any(not row['running'] or row['paused'] or row['restarting'] or row['dead'] or row['health'] not in (None, 'healthy') for row in containers.values()):
        raise ProtectionChanged('A captured service is not healthy and running')
    files = {name: file_identity(live / name) for name in LIVE_FILES}
    extra = {str(Path(path).resolve()): file_identity(path) for path in extra_files}
    active = command(['docker', 'exec', 'corp-site-nginx', 'cat', '/etc/nginx/nginx.conf'])
    return {'containers': containers, 'files': files, 'extraFiles': extra,
            'activeNginxSha256': hashlib.sha256(active.encode()).hexdigest()}


def assert_no_hold(value):
    if any(value['files'].get(name) is not None for name in ('.DO_NOT_DEPLOY', 'DEPLOYMENT_IN_PROGRESS.json')):
        raise ProtectionChanged('Deployment is blocked or requires reconciliation')


def compare(before, after, *, allow_healthy_restart=False, changed_components=(), own_files=()):
    if set(before['containers']) != set(after['containers']):
        raise ProtectionChanged('Container inventory changed')
    allowed_names = {'/corp-site-' + name for name in changed_components}
    for name, original in before['containers'].items():
        if name in allowed_names:
            continue
        observed = after['containers'][name]
        prior, current = copy.deepcopy(original), copy.deepcopy(observed)
        if allow_healthy_restart and prior['startedAt'] != current['startedAt']:
            if prior['health'] != 'healthy' or current['health'] != 'healthy':
                raise ProtectionChanged('A restarted service has no healthy verification')
            prior.pop('startedAt')
            current.pop('startedAt')
        if prior != current:
            raise ProtectionChanged('Protected container identity or runtime changed')
    for section in ('files', 'extraFiles'):
        if set(before[section]) != set(after[section]):
            raise ProtectionChanged('Protected file inventory changed')
        for name, identity in before[section].items():
            if section == 'files' and name in own_files:
                continue
            if after[section][name] != identity:
                raise ProtectionChanged('Protected configuration, receipt or hold changed')
    if before['activeNginxSha256'] != after['activeNginxSha256']:
        raise ProtectionChanged('Active proxy configuration changed')


def capture(path, live, manifest, command, extra_files=()):
    value = snapshot(live, command, extra_files)
    assert_no_hold(value)
    record = {'schemaVersion': 1, 'capturedAt': now(), 'live': str(Path(live).resolve()),
              'manifestSha256': digest(manifest), 'snapshot': value}
    exclusive_json(path, record)
    return {'captured': True, 'containersProtected': len(value['containers']), 'baselineSha256': digest(record)}


class PreparationGuard:
    def __init__(self, baseline_path, release, command):
        self.baseline_path, self.release, self.command = Path(baseline_path), release, command
        file_identity(self.baseline_path)
        self.record = json.loads(self.baseline_path.read_text())
        if self.record.get('schemaVersion') != 1 or self.record.get('manifestSha256') != digest(release.manifest) or self.record.get('live') != str(release.live.resolve()):
            raise InvalidBaseline('Preparation baseline belongs to a different release')
        self.baseline_file = file_identity(self.baseline_path)
        self.before = None
        self.pending_identity = None
        self.committed_receipt = None

    def current(self):
        if file_identity(self.baseline_path) != self.baseline_file:
            raise ProtectionChanged('Frozen preparation evidence changed')
        return snapshot(self.release.live, self.command, self.record['snapshot']['extraFiles'])

    def begin(self):
        self.before = self.current()
        assert_no_hold(self.before)
        compare(self.record['snapshot'], self.before, allow_healthy_restart=True)
        exclusive_json(self.release.audit / 'effective-preparation-baseline.json',
                       {'schemaVersion': 1, 'capturedAt': now(), 'frozenBaselineSha256': digest(self.record),
                        'manifestSha256': digest(self.release.manifest), 'snapshot': self.before})

    def check(self, stage, expected_receipt=None, expected_pending=None):
        if stage == 'before-recovery':
            # A foreign interruption marker means ownership is lost. Do not touch its release.
            if not self.owns_pending():
                raise ProtectionChanged('Deployment recovery ownership changed')
            return
        current = self.current()
        if stage in {'preflight', 'before-switch'}:
            assert_no_hold(current)
            compare(self.before, current)
            return
        # Core owns only these exact metadata changes, inside its existing rollback transaction.
        own_files = {'DEPLOYMENT_IN_PROGRESS.json'}
        if stage in {'after-commit', 'after-recovery', 'finished'}:
            own_files = OWN_FILES
        compare(self.before, current, changed_components=self.release.components, own_files=own_files)
        if stage == 'switch-start':
            if expected_pending is None or json.loads(self.release.pending_path.read_text()) != expected_pending:
                raise ProtectionChanged('New deployment interruption marker changed')
            self.pending_identity = current['files']['DEPLOYMENT_IN_PROGRESS.json']
        elif stage != 'finished' and current['files']['DEPLOYMENT_IN_PROGRESS.json'] != self.pending_identity:
            raise ProtectionChanged('Deployment interruption marker changed')
        if expected_receipt is not None:
            if json.loads(self.release.receipt_path.read_text()) != expected_receipt:
                raise ProtectionChanged('Committed release receipt changed')
            images = expected_receipt['images']
            if json.loads(self.release.pins_path.read_text()) != {'services': {name: {'image': image, 'pull_policy': 'never'} for name, image in images.items()}}:
                raise ProtectionChanged('Committed image selection changed')
            expected_marker = self.release.original_marker
            if stage in {'after-commit', 'finished'} and self.release.manifest.get('sourceCommit') and not self.release.preserve_frontend:
                expected_marker = (self.release.manifest['sourceCommit'] + '\n').encode()
            marker = self.release.live / 'DEPLOY_COMMIT'
            if (marker.read_bytes() if marker.exists() else None) != expected_marker:
                raise ProtectionChanged('Committed source marker changed')
            if stage == 'after-commit':
                self.committed_receipt = copy.deepcopy(expected_receipt)

    def owns_pending(self):
        try:
            return self.pending_identity is not None and file_identity(self.release.pending_path) == self.pending_identity
        except (OSError, ProtectionChanged):
            return False

    def finish(self, result):
        if not result.get('applied'):
            self.check('preflight')
            return
        self.check('finished', self.committed_receipt)
        if self.release.pending_path.exists() or self.release.pending_path.is_symlink():
            raise ProtectionChanged('Completed release still has an interruption marker')

    def check_failure(self):
        # The trusted in-memory baseline still permits a live-state check when
        # the frozen file itself is the reason the phase failed.
        current = snapshot(self.release.live, self.command, self.record['snapshot']['extraFiles'])
        if self.pending_identity is None:
            # Even an --apply invocation may fail before switching anything.
            assert_no_hold(current)
            compare(self.before, current)
        else:
            # Existing core recovery owns its component and metadata changes only.
            compare(self.before, current, changed_components=self.release.components, own_files=OWN_FILES)


def execute_prepared(release, apply, kind, baseline_path, command):
    guard = PreparationGuard(baseline_path, release, command)
    guard.begin()
    release.phase_guard = guard
    try:
        result = release.execute(apply, kind)
        try:
            guard.finish(result)
        except BaseException:
            if result.get('applied') and not release.pending_path.exists() and not release.pending_path.is_symlink():
                # Reuse the existing interrupted-deployment gate. Never reapply or claim recovery.
                exclusive_json(release.pending_path, {'at': now(), 'auditDirectory': str(release.audit),
                               'previousImages': release.receipt['images'], 'targetImages': release.target,
                               'phaseProtectionFailed': True, 'reconciliationRequired': True})
            raise
        return result
    except BaseException:
        # Every failure still verifies unchanged services; it never replays the switch.
        guard.check_failure()
        raise
    finally:
        del release.phase_guard
