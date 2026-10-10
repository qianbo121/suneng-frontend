import copy
import datetime as dt
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import release_retention as r


def ident(n):
    return 'sha256:' + format(n, '064x')


def source(n):
    return format(n, '040x')


def metadata(current, previous):
    return {'image': ident(current), 'expectedCurrentImage': ident(previous),
            'sourceIdentity': 'git-commit', 'sourceCommit': source(current), 'archiveSha256': 'f' * 64}


class Engine:
    def __init__(self):
        self.records, self.rows, self.removed = {}, [], []
        self.on_remove = None

    def add(self, component, n):
        self.records[ident(n)] = {'id': ident(n), 'tags': [f'suneng-verified-{component}:' + source(n)],
                                 'labels': {'org.opencontainers.image.revision': source(n)},
                                 'layers': [ident(n + 100)]}

    def images(self):
        return copy.deepcopy(self.records)

    def containers(self):
        return copy.deepcopy(self.rows)

    def remove(self, image_id):
        if self.on_remove:
            self.on_remove(image_id)
        self.removed.append(image_id)
        del self.records[image_id]


class RetentionTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.live, self.audit = self.root / 'live', self.root / 'records'
        self.live.mkdir()
        self.audit.mkdir()
        self.engine = Engine()
        # Three historical frontend versions; unrelated components each retain two.
        history = None
        for f in [1, 2, 3]:
            value = {'images': {'frontend': ident(f), 'backend': ident(5), 'admin': ident(7)},
                     'frontendRelease': metadata(f, f - 1), 'backendRelease': metadata(5, 4),
                     'adminRelease': metadata(7, 6), 'deploymentStatus': 'verified'}
            if history:
                value['previousReceipt'] = str(history)
            history = self.audit / ('history-' + str(f) + '.json')
            r.write_json(history, value)
        # Earlier accepted backend/admin states prove ownership of rollback versions.
        oldest = json.loads((self.audit / 'history-1.json').read_text())
        prior = {'images': {'frontend': ident(0), 'backend': ident(4), 'admin': ident(6)},
                 'frontendRelease': metadata(0, 9), 'backendRelease': metadata(4, 8),
                 'adminRelease': metadata(6, 10), 'deploymentStatus': 'verified'}
        r.write_json(self.audit / 'older.json', prior)
        oldest['previousReceipt'] = str(self.audit / 'older.json')
        r.write_json(self.audit / 'history-1.json', oldest)
        current = json.loads(history.read_text())
        current.update(releaseOperation='deploy', releaseOperationReceipt=str(self.audit / 'result.json'),
                       previousReceipt=str(self.audit / 'previous-receipt.json'),
                       productionVerifiedAt=(r.now() - dt.timedelta(minutes=2)).isoformat())
        r.write_json(self.live / 'RELEASE_ARTIFACTS.json', current)
        previous = json.loads((self.audit / 'history-2.json').read_text())
        r.write_json(self.audit / 'previous-receipt.json', previous)
        r.write_json(self.audit / 'result.json', {'passed': True, 'applied': True, 'kind': 'deploy', 'components': ['frontend']})
        (self.live / 'verified-images.override.yml').write_text('services:\n  frontend:\n    image: ' + ident(3))
        for component, numbers in [('frontend', [1, 2, 3]), ('backend', [4, 5]), ('admin', [6, 7]), ('other-app', [20])]:
            for n in numbers:
                self.engine.add(component, n)
        self.engine.rows = [{'name': '/corp-site-' + name, 'id': name, 'image': ident(n),
                             'running': True, 'health': 'healthy', 'started': 'unchanged'}
                            for name, n in [('frontend', 3), ('backend', 5), ('admin', 7)]]
        self.plan = Path(r.queue(self.live, self.audit, ['frontend'], source(3))['plan'])
        evidence = []
        for purpose in ['browser', 'recovery']:
            file = self.audit / (purpose + '.txt')
            file.write_text(purpose + ' verification evidence')
            evidence.append({'path': str(file), 'purpose': purpose, 'sha256': r.digest(file.read_bytes())})
        self.acceptance = self.audit / 'acceptance.json'
        r.write_json(self.acceptance, {'schemaVersion': 1, 'sourceCommit': source(3), 'images': current['images'],
                                     'passed': True, 'browserPassed': True, 'recoveryVerified': True,
                                     'checkedAt': (r.now() - dt.timedelta(minutes=1)).isoformat(),
                                     'operationReceiptSha256': r.digest((self.audit / 'result.json').read_bytes()),
                                     'evidence': evidence})
        self.finalizer = r.Finalizer(self.plan, self.acceptance, self.root, self.engine)

    def change_acceptance(self, **values):
        data = json.loads(self.acceptance.read_text())
        data.update(values)
        r.write_json(self.acceptance, data)

    def test_preview_never_deletes_and_apply_keeps_two_versions_and_other_systems(self):
        before = set(self.engine.records)
        plan = self.finalizer.execute()
        self.assertEqual([t['image'] for t in plan['targets']], [ident(1)])
        self.assertEqual(self.engine.removed, [])
        result = self.finalizer.execute(apply=True)
        self.assertTrue(result['passed'])
        self.assertEqual(self.engine.removed, [ident(1)])
        self.assertEqual(set(self.engine.records), before - {ident(1)})
        self.assertEqual(self.finalizer.execute(apply=True)['removed'], [])

    def test_docker_removes_only_exact_identity_without_pruning_parents(self):
        engine = r.Docker()
        with patch.object(engine, 'run') as run:
            engine.remove(ident(1))
        run.assert_called_once_with(['image', 'rm', '--no-prune', ident(1)])

    def test_unpublished_candidates_are_never_swept(self):
        self.engine.add('frontend', 99)
        self.finalizer.execute(apply=True)
        self.assertIn(ident(99), self.engine.records)

    def test_stopped_container_references_and_explicit_protection_prevent_deletion(self):
        for protect in ['container', 'file', 'label', 'config', 'extra-tag']:
            with self.subTest(protect=protect):
                rows = copy.deepcopy(self.engine.rows)
                image = copy.deepcopy(self.engine.records[ident(1)])
                if protect == 'container':
                    self.engine.rows.append({'name': '/old-check', 'id': 'old', 'image': ident(1),
                                             'running': False, 'health': None, 'started': 'old'})
                elif protect == 'file':
                    r.write_json(self.live / 'RETENTION_PROTECTED_IMAGES.json', [ident(1)])
                elif protect == 'label':
                    self.engine.records[ident(1)]['labels']['org.jssngyl.retention.protect'] = 'true'
                elif protect == 'config':
                    (self.live / 'custom.yml').write_text('image: ' + ident(1))
                else:
                    self.engine.records[ident(1)]['tags'].append('other-system:retained')
                self.assertEqual(self.finalizer.execute(apply=True)['removed'], [])
                self.engine.rows = rows
                self.engine.records[ident(1)] = image
                for name in ['RETENTION_PROTECTED_IMAGES.json', 'custom.yml']:
                    (self.live / name).unlink(missing_ok=True)

    def test_rejects_failed_missing_stale_or_wrong_version_acceptance(self):
        original = self.acceptance.read_bytes()
        for change in [{'browserPassed': False}, {'recoveryVerified': False}, {'passed': False},
                       {'images': {}}, {'sourceCommit': source(2)}, {'evidence': []},
                       {'operationReceiptSha256': '0' * 64},
                       {'checkedAt': (r.now() - dt.timedelta(days=2)).isoformat()},
                       {'checkedAt': (r.now() + dt.timedelta(minutes=1)).isoformat()},
                       {'checkedAt': r.now().replace(tzinfo=None).isoformat()}]:
            with self.subTest(change=change):
                self.acceptance.write_bytes(original)
                self.change_acceptance(**change)
                with self.assertRaises((ValueError, RuntimeError)):
                    self.finalizer.execute(apply=True)
        self.assertEqual(self.engine.removed, [])

    def test_changed_evidence_or_live_version_blocks_before_mutation(self):
        (self.audit / 'browser.txt').write_text('changed')
        with self.assertRaises(ValueError):
            self.finalizer.execute(apply=True)
        self.assertEqual(self.engine.removed, [])

    def test_missing_recovery_image_or_unhealthy_live_service_stops_cleanup(self):
        old = self.engine.records.pop(ident(2))
        with self.assertRaises(RuntimeError):
            self.finalizer.execute(apply=True)
        self.engine.records[ident(2)] = old
        self.engine.rows[0]['health'] = 'unhealthy'
        with self.assertRaises(RuntimeError):
            self.finalizer.execute(apply=True)
        self.assertEqual(self.engine.removed, [])

    def test_failed_or_rollback_operation_never_cleans(self):
        operation = self.audit / 'result.json'
        for values in [{'passed': False}, {'applied': False}, {'kind': 'rollback'}]:
            value = {'passed': True, 'applied': True, 'kind': 'deploy', 'components': ['frontend'], **values}
            r.write_json(operation, value)
            self.change_acceptance(operationReceiptSha256=r.digest(operation.read_bytes()))
            with self.assertRaises(ValueError):
                self.finalizer.execute(apply=True)
        self.assertEqual(self.engine.removed, [])

    def test_pending_marker_and_symlink_evidence_stop_cleanup(self):
        marker = self.live / 'DEPLOYMENT_IN_PROGRESS.json'
        marker.write_text('{}')
        with self.assertRaises(RuntimeError):
            self.finalizer.execute(apply=True)
        marker.unlink()
        browser = self.audit / 'browser.txt'
        browser.unlink()
        browser.symlink_to(self.audit / 'recovery.txt')
        with self.assertRaises(ValueError):
            self.finalizer.execute(apply=True)
        with self.assertRaises(ValueError):
            r.read_file(self.audit / '..' / 'live' / 'RELEASE_ARTIFACTS.json', self.audit)

    def test_cleanup_failure_is_recorded_without_altering_live_receipt_or_recovery(self):
        before = (self.live / 'RELEASE_ARTIFACTS.json').read_bytes()
        def fail(_):
            raise RuntimeError('simulated Docker error')
        self.engine.on_remove = fail
        with self.assertRaises(RuntimeError):
            self.finalizer.execute(apply=True)
        self.assertEqual((self.live / 'RELEASE_ARTIFACTS.json').read_bytes(), before)
        results = list(self.audit.glob('retention-*/result.json'))
        self.assertEqual(len(results), 1)
        self.assertFalse(json.loads(results[0].read_text())['passed'])
        self.assertIn(ident(2), self.engine.records)


if __name__ == '__main__':
    unittest.main(verbosity=2)
