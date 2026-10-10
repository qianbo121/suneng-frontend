import copy
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest

import preparation_guard as guard


def container(name='/corp-site-frontend'):
    return {'Name': name, 'Id': name + '-id', 'Image': 'sha256:' + 'a' * 64,
            'Config': {'Labels': {'org.opencontainers.image.revision': 'b' * 40}, 'Env': ['PRIVATE=value']},
            'HostConfig': {'RestartPolicy': {'Name': 'unless-stopped'}}, 'Mounts': [],
            'State': {'Running': True, 'StartedAt': 'original', 'Health': {'Status': 'healthy'}}}


class PreparationGuardTest(unittest.TestCase):
    def fixture(self, tmp):
        live, audit = Path(tmp).resolve() / 'live', Path(tmp).resolve() / 'audit'
        live.mkdir()
        audit.mkdir()
        for name in guard.LIVE_FILES:
            if name not in ('.DO_NOT_DEPLOY', 'DEPLOYMENT_IN_PROGRESS.json'):
                (live / name).write_text('initial')
        release = SimpleNamespace(live=live, audit=audit, manifest={'image': 'immutable'}, components=['frontend'])
        rows = [container(), container('/shuju-engine')]
        state = {'rows': rows, 'active': 'proxy configuration'}
        def command(args):
            if args == ['docker', 'ps', '-q']:
                return '\n'.join(row['Id'] for row in state['rows'])
            if args[:2] == ['docker', 'inspect']:
                return json.dumps(state['rows'])
            if args[:3] == ['docker', 'exec', 'corp-site-nginx']:
                return state['active']
            raise AssertionError(args)
        path = Path(tmp).resolve() / 'frozen-baseline.json'
        guard.capture(path, live, release.manifest, command)
        return release, path, state, command

    def test_mount_order_does_not_change_identity_or_mutate_inspection(self):
        row = container('/shuju-engine')
        row['Mounts'] = [
            {'Type': 'bind', 'Source': '/private/source', 'Destination': '/app/data',
             'Mode': 'ro', 'RW': False, 'Propagation': 'rprivate'},
            {'Type': 'volume', 'Name': 'shared-volume', 'Driver': 'local',
             'Source': '/volumes/shared', 'Destination': '/app/cache',
             'Mode': 'rw', 'RW': True, 'Propagation': ''},
        ]
        original = copy.deepcopy(row)
        reversed_row = copy.deepcopy(row)
        reversed_row['Mounts'].reverse()
        self.assertEqual(guard.container_identity(row), guard.container_identity(reversed_row))
        self.assertEqual(row, original)
        self.assertEqual(reversed_row['Mounts'], list(reversed(original['Mounts'])))

    def test_mount_fields_counts_and_unknown_fields_remain_protected(self):
        row = container('/shuju-engine')
        row['Mounts'] = [
            {'Type': 'volume', 'Name': 'shared-volume', 'Driver': 'local',
             'Source': '/volumes/shared', 'Destination': '/app/data',
             'Mode': 'rw', 'RW': True, 'Propagation': 'rprivate'},
        ]
        original = guard.container_identity(row)
        changes = {'Type': 'bind', 'Name': 'another-volume', 'Driver': 'another-driver',
                   'Source': '/volumes/other', 'Destination': '/app/other',
                   'Mode': 'ro', 'RW': False, 'Propagation': 'rshared'}
        for field, value in changes.items():
            with self.subTest(field=field):
                changed = copy.deepcopy(row)
                changed['Mounts'][0][field] = value
                self.assertNotEqual(original, guard.container_identity(changed))
        for change in ('added-field', 'removed-field', 'added-mount', 'removed-mount'):
            with self.subTest(change=change):
                changed = copy.deepcopy(row)
                if change == 'added-field': changed['Mounts'][0]['AdditionalOptions'] = {'readOnly': True}
                elif change == 'removed-field': changed['Mounts'][0].pop('Mode')
                elif change == 'added-mount': changed['Mounts'].append(copy.deepcopy(changed['Mounts'][0]))
                else: changed['Mounts'].clear()
                self.assertNotEqual(original, guard.container_identity(changed))

    def test_preflight_accepts_reordered_mounts_but_rejects_permission_change(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, path, state, command = self.fixture(tmp)
            row = state['rows'][1]
            row['Mounts'] = [
                {'Type': 'bind', 'Source': '/private/data', 'Destination': '/app/data', 'RW': False},
                {'Type': 'bind', 'Source': '/private/cache', 'Destination': '/app/cache', 'RW': True},
            ]
            path.unlink()
            guard.capture(path, release.live, release.manifest, command)
            operation = guard.PreparationGuard(path, release, command)
            operation.begin()
            row['Mounts'].reverse()
            operation.check('preflight')
            row['Mounts'][0]['RW'] = not row['Mounts'][0]['RW']
            with self.assertRaises(guard.ProtectionChanged):
                operation.check('preflight')

    def test_healthy_same_identity_restart_refreshes_only_effective_baseline(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, path, state, command = self.fixture(tmp)
            original = path.read_bytes()
            state['rows'][0]['State']['StartedAt'] = 'healthy restart'
            operation = guard.PreparationGuard(path, release, command)
            operation.begin()
            self.assertEqual(path.read_bytes(), original)
            effective = json.loads((release.audit / 'effective-preparation-baseline.json').read_text())
            self.assertEqual(effective['snapshot']['containers']['/corp-site-frontend']['startedAt'], 'healthy restart')
            self.assertNotIn('PRIVATE=value', path.read_text())

    def test_image_id_source_health_config_runtime_and_set_changes_reject(self):
        for change in ('image', 'id', 'source', 'health', 'config', 'set', 'running', 'active-config'):
            with self.subTest(change=change), tempfile.TemporaryDirectory() as tmp:
                release, path, state, command = self.fixture(tmp)
                row = state['rows'][0]
                if change == 'image': row['Image'] = 'sha256:' + 'c' * 64
                elif change == 'id': row['Id'] = 'replacement-id'
                elif change == 'source': row['Config']['Labels']['org.opencontainers.image.revision'] = 'd' * 40
                elif change == 'health': row['State']['Health']['Status'] = 'starting'
                elif change == 'config': row['Config']['Env'] = ['PRIVATE=changed']
                elif change == 'set': state['rows'].append(container('/new-shared-service'))
                elif change == 'running': row['State']['Running'] = False
                else: state['active'] = 'different proxy configuration'
                with self.assertRaises(guard.ProtectionChanged):
                    guard.PreparationGuard(path, release, command).begin()

    def test_configuration_receipt_and_hold_changes_reject(self):
        for name in guard.LIVE_FILES:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as tmp:
                release, path, state, command = self.fixture(tmp)
                (release.live / name).write_text('changed')
                with self.assertRaises(guard.ProtectionChanged):
                    guard.PreparationGuard(path, release, command).begin()

    def test_restart_with_no_healthcheck_or_changed_health_is_not_refreshable(self):
        for health in (None, 'starting', 'unhealthy'):
            with self.subTest(health=health), tempfile.TemporaryDirectory() as tmp:
                release, path, state, command = self.fixture(tmp)
                if health is None:
                    state['rows'][0]['State'].pop('Health')
                    path.unlink()
                    guard.capture(path, release.live, release.manifest, command)
                else:
                    state['rows'][0]['State']['Health']['Status'] = health
                state['rows'][0]['State']['StartedAt'] = 'new restart'
                with self.assertRaises(guard.ProtectionChanged):
                    guard.PreparationGuard(path, release, command).begin()

    def test_transaction_restart_remains_strict_for_any_service(self):
        for index in (0, 1):
            with self.subTest(index=index), tempfile.TemporaryDirectory() as tmp:
                release, path, state, command = self.fixture(tmp)
                operation = guard.PreparationGuard(path, release, command)
                operation.begin()
                state['rows'][index]['State']['StartedAt'] = 'mid-phase restart'
                with self.assertRaises(guard.ProtectionChanged):
                    operation.check('preflight')

    def test_frozen_capture_never_overwrites_existing_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, path, state, command = self.fixture(tmp)
            original = path.read_bytes()
            with self.assertRaises(FileExistsError):
                guard.capture(path, release.live, release.manifest, command)
            self.assertEqual(path.read_bytes(), original)
            with self.assertRaises(guard.InvalidBaseline):
                guard.PreparationGuard(path, SimpleNamespace(live=release.live, manifest={'image': 'another'}), command)

    def test_shared_configuration_is_protected_by_digest(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, path, state, command = self.fixture(tmp)
            extra = Path(tmp).resolve() / 'shared.conf'
            extra.write_text('private')
            other = Path(tmp).resolve() / 'new-baseline.json'
            guard.capture(other, release.live, release.manifest, command, [extra])
            extra.write_text('changed')
            with self.assertRaises(guard.ProtectionChanged):
                guard.PreparationGuard(other, release, command).begin()


if __name__ == '__main__':
    unittest.main()
