import contextlib
import io
import json
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import release_closeout as closeout
import release_retention as retention
import release_storage_status as status
import storage_policy as storage
import test_release_retention as fixtures

ident = fixtures.ident


class StorageStatusTest(unittest.TestCase):
    setUp = fixtures.RetentionTest.setUp
    change_acceptance = fixtures.RetentionTest.change_acceptance

    def report(self, **kwargs):
        return status.Status(self.live, self.root).read(**kwargs)

    def runner(self):
        return closeout.Closeout(self.plan, self.acceptance, self.root, self.engine)

    def preflight(self):
        output = self.audit / 'closeout-preflight'
        self.runner().run(output)
        return output / 'preflight.json'

    def apply(self, preflight=None):
        return self.runner().run(self.audit / 'closeout-apply', True, preflight or self.preflight())

    def test_pending_and_preflight_never_claim_cleanup_and_status_never_mutates(self):
        tracked = {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        with patch.object(retention.Docker, 'run', side_effect=AssertionError('No Docker access allowed')):
            report = self.report()
        self.assertEqual(report['status'], 'pending')
        self.assertTrue(report['readOnly'])
        self.assertFalse(report['deletionAuthorized'])
        self.assertEqual({p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()}, tracked)
        self.preflight()
        self.assertEqual(self.report()['status'], 'pending')
        self.assertFalse((self.audit / 'retention-latest.json').exists())
        self.assertEqual(self.engine.removed, [])

    def test_success_is_bound_to_real_results_and_current_space_is_fresh(self):
        protected = [self.plan, self.acceptance, self.audit / 'result.json', self.live / 'RELEASE_ARTIFACTS.json']
        original = {p: p.read_bytes() for p in protected}
        result = self.apply()
        latest = json.loads((self.audit / 'retention-latest.json').read_text())
        self.assertEqual(latest['closeoutResultSha256'], retention.digest(Path(latest['closeoutResult']).read_bytes()))
        self.assertEqual(latest['status'], 'cleaned')
        with patch.object(status.shutil, 'disk_usage', return_value=SimpleNamespace(free=987654321)):
            report = self.report()
        self.assertEqual(report['status'], 'cleaned')
        self.assertEqual(report['closeout']['removed'], [ident(1)])
        self.assertEqual(report['space']['availableBytes'], 987654321)
        self.assertEqual(report['closeout']['freeBytesAtCloseout'], result['freeBytesAfter'])
        self.assertEqual({p: p.read_bytes() for p in protected}, original)

    def test_zero_deletion_keeps_skipped_objects_and_does_not_claim_all_history_clean(self):
        self.engine.records[ident(1)]['labels']['org.jssngyl.retention.protect'] = 'true'
        result = self.apply()
        report = self.report()
        self.assertEqual(report['status'], 'no-targets')
        self.assertEqual(report['closeout']['deletedImageCount'], 0)
        self.assertTrue(report['closeout']['skipped'])
        self.assertTrue(report['needsAttention'])
        self.assertEqual(result['reclaimedBytes'], 0)
        self.assertEqual(self.engine.removed, [])

    def test_preinspection_failures_are_latest_failed_attempts_and_delete_nothing(self):
        preflight = self.preflight()
        (self.audit / 'browser.txt').unlink()
        with self.assertRaises(ValueError):
            self.apply(preflight)
        report = self.report()
        self.assertEqual(report['status'], 'failed')
        self.assertEqual(report['closeout']['deletedImageCount'], 0)
        self.assertEqual(self.engine.removed, [])
        self.assertIn('freeBytesAtCloseout', report['closeout'])

    def test_missing_acceptance_is_recorded_as_failed_without_fabricated_evidence(self):
        preflight = self.preflight()
        self.acceptance.unlink()
        with self.assertRaises(ValueError):
            self.apply(preflight)
        latest = json.loads((self.audit / 'retention-latest.json').read_text())
        self.assertIsNone(latest['acceptanceSha256'])
        self.assertEqual(self.report()['status'], 'failed')
        self.assertEqual(self.engine.removed, [])

    def test_removal_failure_and_post_cleanup_failure_never_report_cleaned(self):
        preflight = self.preflight()
        def fail(_):
            raise RuntimeError('simulated removal failure')
        self.engine.on_remove = fail
        with self.assertRaises(RuntimeError):
            self.apply(preflight)
        self.assertEqual(self.report()['status'], 'failed')
        self.assertEqual(self.report()['closeout']['removed'], [])

    def test_raw_success_followed_by_final_check_failure_reports_actual_removal_and_failed(self):
        preflight = self.preflight()
        original = self.engine.containers
        calls = [0]
        def changed_final_configuration():
            calls[0] += 1
            if calls[0] == 5:
                (self.live / 'changed-final.yaml').write_text('setting: changed')
            return original()
        self.engine.containers = changed_final_configuration
        with self.assertRaises(RuntimeError):
            self.apply(preflight)
        report = self.report()
        self.assertEqual(report['status'], 'failed')
        self.assertEqual(report['closeout']['removed'], [ident(1)])
        raw = json.loads(next(self.audit.glob('retention-*/result.json')).read_text())
        self.assertTrue(raw['passed'])
        self.assertFalse(json.loads((self.audit / 'closeout-apply' / 'closeout-result.json').read_text())['passed'])

    def test_latest_final_write_failure_cannot_leave_old_success_current(self):
        preflight = self.preflight()
        with patch.object(closeout, 'save_latest', side_effect=OSError('state write failed')):
            with self.assertRaises(OSError):
                self.apply(preflight)
        report = self.report()
        self.assertEqual(report['status'], 'pending')
        self.assertEqual(report['reason'], 'closeout-started-without-final-state')
        own = json.loads((self.audit / 'closeout-apply' / 'closeout-result.json').read_text())
        self.assertFalse(own['passed'])
        self.assertEqual(own['latestStateFailureType'], 'OSError')

    def test_missing_plan_and_different_current_receipt_are_separate(self):
        original = self.plan.read_bytes()
        self.plan.unlink()
        self.assertEqual(self.report()['status'], 'missing')
        self.plan.write_bytes(original)
        value = json.loads((self.live / 'RELEASE_ARTIFACTS.json').read_text())
        value['currentReleaseNote'] = 'A new current receipt must be assessed separately'
        retention.write_json(self.live / 'RELEASE_ARTIFACTS.json', value)
        self.assertEqual(self.report()['status'], 'new-current')
        self.assertNotIn('closeout', self.report())

    def test_result_or_acceptance_or_operation_tamper_is_unknown(self):
        self.apply()
        latest = json.loads((self.audit / 'retention-latest.json').read_text())
        for path in [Path(latest['closeoutResult']), self.acceptance, self.audit / 'result.json']:
            with self.subTest(path=path):
                original = path.read_bytes()
                value = json.loads(original)
                value['changedAfterCloseout'] = True
                retention.write_json(path, value)
                self.assertEqual(self.report()['status'], 'unknown')
                path.write_bytes(original)
        self.assertEqual(self.report()['status'], 'cleaned')

    def test_missing_or_changed_actual_browser_and_recovery_material_is_unknown(self):
        self.apply()
        for path in [self.audit / 'browser.txt', self.audit / 'recovery.txt']:
            original = path.read_bytes()
            for missing in [False, True]:
                with self.subTest(path=path, missing=missing):
                    if missing:
                        path.unlink()
                    else:
                        path.write_bytes(b'Changed retained acceptance material')
                    self.assertEqual(self.report()['status'], 'unknown')
                    path.write_bytes(original)
        self.assertEqual(self.report()['status'], 'cleaned')

    def test_completed_history_does_not_expire_after_acceptance_execution_window(self):
        self.apply()
        later = retention.now() + fixtures.dt.timedelta(days=2)
        with patch.object(retention, 'now', return_value=later):
            self.assertEqual(self.report()['status'], 'cleaned')

    def test_partial_deletion_failure_keeps_actual_count_and_protected_versions(self):
        current_path = self.live / 'RELEASE_ARTIFACTS.json'
        current = json.loads(current_path.read_text())
        current['images']['backend'] = ident(8)
        current['backendRelease'] = fixtures.metadata(8, 5)
        retention.write_json(current_path, current)
        operation = self.audit / 'result.json'
        retention.write_json(operation, {'passed': True, 'applied': True, 'kind': 'deploy',
                                        'components': ['frontend', 'backend']})
        retention.queue(self.live, self.audit, ['frontend', 'backend'], fixtures.source(3))
        self.change_acceptance(images=current['images'], operationReceiptSha256=retention.digest(operation.read_bytes()))
        self.engine.add('backend', 8)
        self.engine.rows[1]['image'] = ident(8)
        preflight = self.preflight()
        def fail_second(image):
            if image == ident(1):
                raise RuntimeError('second removal failed')
        self.engine.on_remove = fail_second
        with self.assertRaises(RuntimeError):
            self.apply(preflight)
        report = self.report()
        self.assertEqual(report['status'], 'failed')
        self.assertEqual(report['closeout']['deletedImageCount'], 1)
        self.assertEqual(report['closeout']['removed'], [ident(4)])
        self.assertEqual(self.engine.removed, [ident(4)])
        for number in [1, 2, 3, 5, 6, 7, 8, 20]:
            self.assertIn(ident(number), self.engine.records)

    def test_failed_attempt_still_binds_original_operation_bytes(self):
        preflight = self.preflight()
        (self.audit / 'browser.txt').unlink()
        with self.assertRaises(ValueError):
            self.apply(preflight)
        self.assertEqual(self.report()['status'], 'failed')
        operation = self.audit / 'result.json'
        value = json.loads(operation.read_text())
        value['changedAfterFailure'] = True
        retention.write_json(operation, value)
        self.assertEqual(self.report()['status'], 'unknown')

    def test_in_progress_publication_and_symlink_state_do_not_reuse_success(self):
        self.apply()
        marker = self.live / 'DEPLOYMENT_IN_PROGRESS.json'
        marker.write_text('{}')
        self.assertEqual(self.report()['status'], 'unknown')
        marker.unlink()
        latest = self.audit / 'retention-latest.json'
        saved = latest.read_bytes()
        latest.unlink()
        other = self.audit / 'saved-state.json'
        other.write_bytes(saved)
        latest.symlink_to(other)
        self.assertEqual(self.report()['status'], 'unknown')

    def candidate(self, image_bytes=100 * 1024**2, archive_bytes=80 * 1024**2):
        path = self.root / 'candidate.json'
        retention.write_json(path, {'imageTag': 'suneng-verified-frontend:' + fixtures.source(99),
                                    'imageBytes': image_bytes, 'archiveBytes': archive_bytes})
        return path, retention.digest(path.read_bytes())

    def test_capacity_uses_actual_candidate_formula_without_fifteen_gib_gate(self):
        candidate = self.candidate()
        with patch.object(status.shutil, 'disk_usage', return_value=SimpleNamespace(free=9 * storage.GIB)):
            report = self.report(candidates=[candidate], image_store=self.live, staging=self.audit)
        self.assertTrue(report['capacity']['passed'])
        self.assertEqual(len(report['capacity']['filesystems']), 1)
        self.assertEqual(report['capacity']['filesystems'][0]['requiredBytes'],
                         5 * storage.GIB + 280 * 1024**2)
        self.assertFalse(report['capacity']['cleanupBytesSubtracted'])
        self.assertEqual(self.engine.removed, [])

    def test_insufficient_capacity_and_unbound_candidate_cannot_authorize_cleanup(self):
        candidate = self.candidate(image_bytes=storage.GIB, archive_bytes=storage.GIB)
        with patch.object(status.shutil, 'disk_usage', return_value=SimpleNamespace(free=6 * storage.GIB)):
            report = self.report(candidates=[candidate], image_store=self.live, staging=self.audit)
        self.assertFalse(report['capacity']['passed'])
        self.assertEqual(report['status'], 'pending')
        self.assertTrue(report['needsAttention'])
        report = self.report(candidates=[(candidate[0], '0' * 64)], image_store=self.live, staging=self.audit)
        self.assertFalse(report['capacity']['passed'])
        self.assertEqual(report['capacity']['failureType'], 'ValueError')
        self.assertEqual(self.engine.removed, [])

    def test_candidate_metadata_has_bounded_read_and_external_hash(self):
        path = self.root / 'too-large.json'
        path.write_bytes(b' ' * (status.MAX_CANDIDATE_BYTES + 1))
        with self.assertRaises(ValueError), patch.object(status.os, 'open', side_effect=AssertionError('must reject before open')):
            status.candidate_metadata(path, retention.digest(path.read_bytes()))

    def test_cli_bound_candidate_capacity_pass_is_not_blocked_by_unverifiable_cleanup(self):
        candidate = self.candidate()
        (self.live / 'RELEASE_ARTIFACTS.json').write_text('{invalid current receipt}')
        argv = ['release_storage_status.py', '--live', str(self.live), '--records-root', str(self.root),
                '--candidate', str(candidate[0]), candidate[1], '--image-store', str(self.live), '--staging', str(self.audit)]
        output = io.StringIO()
        with patch('sys.argv', argv), contextlib.redirect_stdout(output), \
                patch.object(status.shutil, 'disk_usage', return_value=SimpleNamespace(free=9 * storage.GIB)):
            self.assertEqual(status.main(), 0)
        report = json.loads(output.getvalue())
        self.assertEqual(report['status'], 'unknown')
        self.assertTrue(report['needsAttention'])
        self.assertTrue(report['capacity']['passed'])
        self.assertEqual(self.engine.removed, [])

    def test_cli_capacity_failure_has_existing_gate_exit_code(self):
        candidate = self.candidate(image_bytes=storage.GIB, archive_bytes=storage.GIB)
        argv = ['release_storage_status.py', '--live', str(self.live), '--records-root', str(self.root),
                '--candidate', str(candidate[0]), candidate[1], '--image-store', str(self.live), '--staging', str(self.audit)]
        with patch('sys.argv', argv), contextlib.redirect_stdout(io.StringIO()), \
                patch.object(status.shutil, 'disk_usage', return_value=SimpleNamespace(free=6 * storage.GIB)):
            self.assertEqual(status.main(), 75)


if __name__ == '__main__':
    unittest.main(verbosity=2)
