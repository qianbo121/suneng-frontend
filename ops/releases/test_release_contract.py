"""Synthetic handoffs test fail-fast rules; they are not production evidence."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import release_contract as c

SOURCE = 'a' * 40
HASH = 'b' * 64


def recovery_input(source=SOURCE):
    value = {key: {} for key in c.RECOVERY_INPUTS}
    value.update(schemaVersion=1, kind='actual-post-apply-recovery-check-input',
        actualPostApplyOriginals=True, referenceSha256=HASH, sourceCommit=source,
        maintainedToolsSha256={'storage_policy.py': HASH}, localFormalReportSha256=HASH,
        futureServerPassed=False, futureReleaseAccepted=False,
        toolsPins={'storage_policy.py': HASH},
        baseline={'snapshot': {'syntheticFixture': True},
                  'allContainerIdentities': [{'synthetic': i} for i in range(16)]},
        formalRecords={name: {'path': '/synthetic/'+name, 'sha256': HASH}
                       for name in ('current', 'previous', 'operation', 'retentionPlan')},
        expectedCurrentImages={'frontend': 'sha256:'+HASH}, historicalFourImagesExpected={'synthetic': True},
        sixNativeProtectedImages=[{'image': 'sha256'+str(i)} for i in range(6)],
        protectedConfigurationFiles=[{'path': '/synthetic/config'}],
        frontendVersions=[{'role': role, 'sourceCommit': source if role == 'current' else 'c'*40,
                          'runtimeImage': 'sha256:'+(HASH if role == 'current' else 'c'*64),
                          'archiveSha256': HASH, 'archiveBytes': 123}
                         for role in ('current', 'previous')])
    return value


def recovery_report(value, digest):
    return {'syntheticFixture': True, 'kind': 'fresh-read-only-server-recovery-material-observation',
        'passed': True, 'readOnly': True,
        'inputRead': {'sha256': digest, 'fullReadMatched': True, 'regularSingleLink': True,
                      'stableDescriptorAndPathDuringRead': True},
        'archiveChecks': {x['role']: {'sha256': x['archiveSha256'], 'bytes': x['archiveBytes'],
                                    'sourceCommit': x['sourceCommit'], 'passed': True}
                         for x in value['frontendVersions']},
        'toolPins': dict(value['maintainedToolsSha256']),
        'productionReceiptSha256': HASH, 'previousReceiptSha256': HASH,
        'operationReceiptSha256': HASH, 'retentionPlanSha256': HASH,
        'localFormalReportSha256': HASH,
        'startedAtUtc': '2026-10-10T12:00:20+00:00', 'finishedAtUtc': '2026-10-10T12:00:30+00:00',
        'restorePerformed': False, 'cleanupPerformed': False, 'releaseAccepted': False,
        'productionBrowserAccepted': False, 'containerCount': 16,
        'allSixteenServicesAndConfigurationsUnchanged': True,
        'containerMetadataUnchangedDuringCheck': True, 'originalThirtyToolPinsUnchanged': True}


class ContractTest(unittest.TestCase):
    def test_actual_recovery_input_shape_is_complete_without_claiming_success(self):
        r = c.check_recovery_input(recovery_input(), SOURCE)
        self.assertTrue(r['inputComplete']); self.assertFalse(r['recoveryVerified'])
        self.assertFalse(r['releaseAccepted'])

    def test_original_missing_baseline_and_tool_pins_fail_before_observation(self):
        value = recovery_input(); del value['baseline']; del value['toolsPins']
        with self.assertRaisesRegex(c.ContractError, 'baseline, toolsPins'):
            c.check_recovery_input(value, SOURCE)

    def test_wrong_source_future_success_and_false_string_are_rejected(self):
        for name, item in [('sourceCommit', 'd'*40), ('futureServerPassed', True),
                           ('futureReleaseAccepted', 'false'), ('actualPostApplyOriginals', 1)]:
            with self.subTest(name=name):
                value = recovery_input(); value[name] = item
                with self.assertRaises(c.ContractError): c.check_recovery_input(value, SOURCE)

    def test_incomplete_formal_records_and_tool_traversal_are_rejected(self):
        value = recovery_input(); value['formalRecords'].pop('previous')
        with self.assertRaises(c.ContractError): c.check_recovery_input(value, SOURCE)
        value = recovery_input(); value['toolsPins'] = {'../outside.py': HASH}
        with self.assertRaises(c.ContractError): c.check_recovery_input(value, SOURCE)

    def test_preview_health_is_not_verification_or_acceptance(self):
        r = c.normalize_step_result('preview', {'healthy': True})
        self.assertTrue(r['succeeded']); self.assertFalse(r['browserAccepted'])
        with self.assertRaises(c.ContractError): c.normalize_step_result('verification', {'healthy': True})
        with self.assertRaises(c.ContractError): c.normalize_step_result('preview', {'healthy': True, 'passed': False})

    def test_failed_or_truthy_nonboolean_result_cannot_pass(self):
        for item in (False, 1, 'true'):
            with self.assertRaises(c.ContractError): c.normalize_step_result('verification', {'passed': item})

    def test_fresh_context_budget_accounts_for_all_three_navigations(self):
        self.assertEqual(c.fresh_context_budget(), 180000)
        self.assertEqual(c.fresh_context_budget(contexts=1), 90000)
        for args in ({'contexts': True}, {'contexts': 25}, {'navigation_ms': 0},
                     {'contexts': 24, 'navigation_ms': 90000}):
            with self.assertRaises(c.ContractError): c.fresh_context_budget(**args)

    def test_bound_read_rejects_changed_and_duplicate_inputs(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp).resolve()/'data.json'; p.write_bytes(b'{"passed":true}')
            digest = hashlib.sha256(p.read_bytes()).hexdigest()
            self.assertTrue(c.read_bound(p, digest)['passed'])
            p.write_bytes(b'{"passed":false}')
            with self.assertRaises(c.ContractError): c.read_bound(p, digest)
            p.write_bytes(b'{"passed":false,"passed":true}')
            with self.assertRaisesRegex(c.ContractError, 'duplicate'):
                c.read_bound(p, hashlib.sha256(p.read_bytes()).hexdigest())

    def test_bound_read_rejects_symlinks(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve(); p=root/'data.json'; p.write_text('{}')
            link=root/'link.json'; link.symlink_to(p)
            with self.assertRaises(RuntimeError): c.read_bound(link, hashlib.sha256(p.read_bytes()).hexdigest())

    def test_bound_observer_report_does_not_claim_new_observation(self):
        value = recovery_input(); report = recovery_report(value, HASH)
        r = c.check_recovery_report(report, value, HASH)
        self.assertTrue(r['recoveryReportValidated']); self.assertFalse(r['newServerObservation'])

    def test_report_mismatches_and_side_effects_are_rejected(self):
        value = recovery_input(); original = recovery_report(value, HASH)
        for change in ('input', 'archive', 'tool', 'configuration', 'restore', 'time'):
            with self.subTest(change=change):
                report = copy.deepcopy(original)
                if change == 'input': report['inputRead']['sha256']='d'*64
                elif change == 'archive': report['archiveChecks']['previous']['passed']=False
                elif change == 'tool': report['toolPins']['storage_policy.py']='d'*64
                elif change == 'configuration': report['allSixteenServicesAndConfigurationsUnchanged']=False
                elif change == 'restore': report['restorePerformed']=True
                else: report['finishedAtUtc']='2026-10-10T11:00:00+00:00'
                with self.assertRaises(c.ContractError): c.check_recovery_report(report, value, HASH)


if __name__ == '__main__': unittest.main()
