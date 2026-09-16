import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('release', Path(__file__).with_name('frontend_release.py'))
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
OLD = 'sha256:' + 'a' * 64
NEW = 'sha256:' + 'b' * 64
RECEIPT = {'images': {'frontend': OLD, 'backend': 'sha256:' + 'c' * 64, 'admin': 'sha256:' + 'd' * 64}, 'deploymentStatus': 'verified'}
MANIFEST = {'schemaVersion': 1, 'image': NEW, 'expectedCurrentImage': OLD, 'publicationScope': r.SCOPE,
            'sourceIdentity': 'git-commit', 'sourceCommit': 'e' * 40, 'archiveSha256': 'f' * 64}
GOOD = {'passed': True, 'sitemapPassed': True, 'checks': []}


def rows(frontend=OLD):
    return [{'Name': '/corp-site-' + name, 'Id': name + (frontend if name == 'frontend' else ''),
             'Image': frontend if name == 'frontend' else RECEIPT['images'].get(name, 'sha256:' + '0' * 64),
             'State': {'Running': True, 'StartedAt': 'unchanged', 'Health': {'Status': 'healthy'}}}
            for name in ['postgres', 'backend', 'admin', 'nginx', 'frontend']]


class ContractTest(unittest.TestCase):
    def test_rejects_mutable_image_missing_identity_or_changed_scope(self):
        for field, value in [('image', 'frontend:latest'), ('sourceCommit', 'main'),
                             ('expectedCurrentImage', ''), ('archiveSha256', ''),
                             ('publicationScope', 'all'), ('sourceIdentity', 'unknown')]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                r.validate_manifest({**MANIFEST, field: value})

    def test_supports_honestly_identified_historical_snapshot(self):
        value = {**MANIFEST, 'sourceIdentity': 'frozen-snapshot', 'sourceManifestSha256': 'a' * 64}
        value.pop('sourceCommit')
        self.assertEqual(r.validate_manifest(value), value)

    def test_rejects_current_version_drift_and_stale_receipt(self):
        with self.assertRaises(RuntimeError):
            r.assert_current(RECEIPT, rows(NEW), OLD)
        wrong = copy.deepcopy(RECEIPT)
        wrong['images']['backend'] = OLD
        with self.assertRaises(RuntimeError):
            r.assert_current(wrong, rows(), OLD)

    def test_route_and_sitemap_failures_never_count_as_success(self):
        for value in [{'passed': False, 'sitemapPassed': True}, {'passed': True, 'sitemapPassed': False}]:
            with patch.object(r, 'run', return_value=json.dumps(value)), self.assertRaises(RuntimeError):
                r.probe('fixture', 'fixture')

    def test_public_health_does_not_accept_404_as_homepage_health(self):
        with patch.object(r, 'run', return_value='404'), self.assertRaises(RuntimeError):
            r.public_probe('https://example.test')

    def test_public_health_rejects_reappearing_retired_page(self):
        with patch.object(r, 'run', return_value='200'), self.assertRaisesRegex(RuntimeError, '/zh/case'):
            r.public_probe('https://example.test')

    def test_waits_for_health_instead_of_only_image_identity(self):
        row = rows()[0]
        row['State']['Health']['Status'] = 'starting'
        with patch.object(r, 'run', return_value=json.dumps([row])), patch.object(r.time, 'sleep'), self.assertRaises(RuntimeError):
            r.wait_healthy('fixture')

    def fixture(self, tmp):
        live = Path(tmp) / 'live'
        audit = Path(tmp) / 'audit'
        live.mkdir()
        audit.mkdir()
        (live / 'RELEASE_ARTIFACTS.json').write_text(json.dumps(RECEIPT))
        (live / 'verified-images.override.yml').write_text('original pins')
        return r.Release(live, audit, MANIFEST, 'fixture health script')

    def test_bad_candidate_fails_before_replacing_frontend_or_receipts(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            with patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', return_value=json.dumps([{'Id': NEW, 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])), \
                 patch.object(r, 'wait_healthy'), patch.object(r, 'probe', side_effect=RuntimeError('retired route returned 200')), \
                 patch.object(r.subprocess, 'run'), patch.object(release, 'replace_frontend') as replace:
                with self.assertRaises(RuntimeError): release.execute(apply=True)
                replace.assert_not_called()
                self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)
                self.assertFalse(release.pending_path.exists())

    def test_hold_and_pending_operation_block_before_docker(self):
        for marker in ['.DO_NOT_DEPLOY', 'DEPLOYMENT_IN_PROGRESS.json']:
            with tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp)
                (release.live / marker).write_text('{}')
                with patch.object(r, 'inspect') as inspect, self.assertRaises(RuntimeError):
                    release.execute(apply=True)
                inspect.assert_not_called()

    def perform(self, release, failure=None):
        state = {'image': OLD, 'switches': 0}
        def inspect(names): return [row for row in rows(state['image']) if row['Name'].removeprefix('/corp-site-') in names]
        def replace(override=None):
            state['switches'] += 1
            if override and failure == 'recovery': raise RuntimeError('restore failure')
            state['image'] = OLD if override else NEW
        def public(_):
            if state['image'] == NEW and failure: raise RuntimeError('public verification failure')
            return [{'path': '/zh', 'status': 200}]
        with patch.object(r, 'inspect', side_effect=inspect), patch.object(r, 'run', return_value=json.dumps([{'Id': NEW, 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])), \
             patch.object(r, 'wait_healthy'), patch.object(r, 'probe', return_value=GOOD), patch.object(r, 'public_probe', side_effect=public), \
             patch.object(r.subprocess, 'run'), patch.object(release, 'replace_frontend', side_effect=replace):
            if failure:
                with self.assertRaises(RuntimeError): release.execute(apply=True, kind='rollback')
            else:
                result = release.execute(apply=True)
                self.assertTrue(result['applied'])
        return state

    def test_dangling_pending_marker_blocks_before_docker(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            release.pending_path.symlink_to(release.live / 'missing')
            with patch.object(r, 'inspect') as inspect, self.assertRaises(RuntimeError):
                release.execute(apply=True)
            inspect.assert_not_called()

    def test_success_updates_running_identity_pins_and_receipt_together(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            state = self.perform(release)
            self.assertEqual(state['image'], NEW)
            receipt = json.loads(release.receipt_path.read_text())
            pins = json.loads(release.pins_path.read_text())
            self.assertEqual(receipt['images']['frontend'], pins['services']['frontend']['image'])
            self.assertEqual(receipt['frontendRelease'], MANIFEST)
            self.assertFalse(release.pending_path.exists())
            self.assertEqual(receipt['images']['backend'], RECEIPT['images']['backend'])

    def test_failed_switch_restores_previous_frontend_and_preserves_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            state = self.perform(release, failure='public')
            self.assertEqual(state, {'image': OLD, 'switches': 2})
            self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)
            self.assertFalse(release.pending_path.exists())

    def test_failed_recovery_reports_actual_image_and_leaves_pending_marker(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            self.perform(release, failure='recovery')
            receipt = json.loads(release.receipt_path.read_text())
            self.assertEqual(receipt['images']['frontend'], NEW)
            self.assertEqual(receipt['deploymentStatus'], 'recovery-required')
            self.assertTrue(release.pending_path.exists())


if __name__ == '__main__':
    unittest.main(verbosity=2)
