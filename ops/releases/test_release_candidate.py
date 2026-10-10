"""Synthetic unit fixtures for preparation only; these are not browser or production acceptance."""
import argparse
import copy
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import browser_capture_guard as guard
import release_candidate as candidate


class CandidateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()

    def save(self, name, value):
        path = self.root/name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value))
        return path, guard.digest(path)

    def fixture(self):
        source = '1'*40; image = 'sha256:'+'2'*64
        frontend = {'id': '3'*64, 'source': source, 'image': image, 'health': 'healthy', 'running': True}
        protected = {'id': '4'*64, 'source': '5'*40, 'image': 'sha256:'+'6'*64, 'health': 'healthy', 'running': True}
        _, baseline_sha = self.save('baseline.json', {'containers': {'/corp-site-frontend': frontend, '/other': protected}})
        contract = {'test-only': {'assertions': ['test-only']}}
        _, contract_sha = self.save('browser/browserContract.json', contract)
        _, plan_sha = self.save('plan.json', {'sourceCommit': source, 'runtimeImage': image,
                               'baselineSha256': baseline_sha, 'browserContractSha256': contract_sha,
                               'browserContract': contract})
        self.initial = {'images': {'frontend': image, 'backend': 'unchanged'},
                        'edgeLegacyProductRouting': {'previousAccepted': True, 'expectedFrontendSource': 'f'*40,
                                                     'preservedFrontendImage': 'sha256:'+'f'*64, 'evidenceSha256': 'f'*64},
                        'business': {'nested': ['preserved', {'value': 8}]}}
        receipt_path, receipt_sha = self.save('receipt.json', self.initial)
        self.final = {'passed': True, 'sourceCommit': source, 'frontendImage': image,
                      'protectedElevenUnchanged': True, 'templateSha256': '7'*64, 'activeConfigSha256': '8'*64,
                      'protectedFilesSha256': {'RELEASE_ARTIFACTS.json': receipt_sha},
                      'containers': {'/corp-site-frontend': frontend, '/other': protected}, 'serviceCount': 2}
        final_path, final_sha = self.save('final.json', self.final)
        summary = {'reviewedCommit': source, 'passed': True, 'mappingCount': 2, 'passedMappings': 2,
                   'raw301': 2, 'final200': 2, 'passedTargetPages': 2, 'resourcesChecked': 1, 'resources200': 1,
                   'targets': [{'path': '/a', 'status': 200, 'missingAnchors': []},
                               {'path': '/b', 'status': 200, 'missingAnchors': []}]}
        summary_path, summary_sha = self.save('summary.json', summary)
        adjacent_path, adjacent_sha = self.save('adjacent.json', {'sourceCommit': source, 'checkCount': 1, 'passed': 1, 'failed': []})
        self.save('browser/before.json', {'container': frontend})
        reports = [{'identityBefore': 'browser/before.json', 'identityAfter': 'browser/before.json',
                    'actualCaseCount': 20},
                   {'identityBefore': 'browser/before.json', 'identityAfter': 'browser/before.json', 'actualTaskCount': 8}]
        self.browser = patch.object(candidate, 'browser_checks', return_value=reports)
        self.browser.start(); self.addCleanup(self.browser.stop)
        return argparse.Namespace(root=self.root, phase='production', plan_sha256=plan_sha,
             current_receipt=receipt_path, current_receipt_sha256=receipt_sha,
             final_state=final_path, final_state_sha256=final_sha,
             summary=summary_path, summary_sha256=summary_sha, adjacent=adjacent_path,
             adjacent_sha256=adjacent_sha, mapping_count=2, target_count=2, resource_count=1,
             adjacent_count=1, template_sha256='7'*64, active_sha256='8'*64,
             report_sha256='9'*64, interaction_sha256='a'*64)

    def test_proposal_changes_only_edge_and_never_installs(self):
        args = self.fixture(); original = args.current_receipt.read_bytes()
        value = candidate.accepted_routing_proposal(args)
        self.assertTrue(value['proposalOnly']); self.assertFalse(value['productionChanged'])
        self.assertEqual(value['receiptProposal']['business'], self.initial['business'])
        self.assertEqual(value['receiptProposal']['images'], self.initial['images'])
        self.assertEqual(args.current_receipt.read_bytes(), original)
        self.assertTrue(value['receiptProposal']['edgeLegacyProductRouting']['accepted'])
        edge = value['receiptProposal']['edgeLegacyProductRouting']
        self.assertNotIn('expectedFrontendSource', edge)
        self.assertNotIn('preservedFrontendImage', edge)
        self.assertNotIn('evidenceSha256', edge)
        self.assertEqual(edge['previousReceiptSha256'], args.current_receipt_sha256)

    def test_stale_receipt_digest_is_rejected(self):
        args = self.fixture(); args.current_receipt.write_text('{}')
        with self.assertRaisesRegex(RuntimeError, 'digest-mismatch'): candidate.accepted_routing_proposal(args)

    def test_changed_protected_service_is_rejected(self):
        args = self.fixture(); self.final['containers']['/other']['id'] = 'b'*64
        _, args.final_state_sha256 = self.save('final.json', self.final)
        with self.assertRaisesRegex(RuntimeError, 'protected-service'): candidate.accepted_routing_proposal(args)

    def test_capture_of_different_frontend_is_rejected(self):
        args = self.fixture(); self.final['containers']['/corp-site-frontend']['id'] = 'b'*64
        _, args.final_state_sha256 = self.save('final.json', self.final)
        with self.assertRaisesRegex(RuntimeError, 'captures-must-match'): candidate.accepted_routing_proposal(args)

    def test_omitted_target_anchor_rejected(self):
        args = self.fixture(); summary = json.loads(args.summary.read_text())
        summary['targets'][0]['missingAnchors'] = ['expected']
        _, args.summary_sha256 = self.save('summary.json', summary)
        with self.assertRaisesRegex(RuntimeError, 'targets-with-anchors'): candidate.accepted_routing_proposal(args)

    def test_invalid_configuration_digest_rejected(self):
        args = self.fixture(); args.template_sha256 = 'not-a-hash'
        with self.assertRaisesRegex(RuntimeError, 'config-digests'): candidate.accepted_routing_proposal(args)

    def test_preview_cannot_close_production_receipt(self):
        args = self.fixture(); args.phase = 'candidate'
        with self.assertRaisesRegex(RuntimeError, 'production-acceptance'): candidate.accepted_routing_proposal(args)

    def test_private_create_only_no_overwrite(self):
        path = self.root/'new.json'; candidate.create(path, {'passed': True})
        self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        original = path.read_bytes()
        with self.assertRaisesRegex(RuntimeError, 'new-private-output'): candidate.create(path, {})
        self.assertEqual(path.read_bytes(), original)

    def test_symlink_output_rejected(self):
        path = self.root/'link'; path.symlink_to(self.root/'absent')
        with self.assertRaisesRegex(RuntimeError, 'new-private-output'): candidate.create(path, {})

    def space_args(self, duplicate=False):
        args = ['check-import-after-transfer', '--candidate', str(self.root/'a.json'),
                '--candidate-sha256', 'c'*64, '--archive', str(self.root/'archive'),
                '--image-store', str(self.root), '--staging', str(self.root), '--receipt', str(self.root/'result.json')]
        if duplicate: args += ['--candidate', str(self.root/'b.json')]
        return args

    def test_multiple_candidates_fail_before_capacity_check(self):
        with patch.object(candidate.storage_policy, 'staged_import_space') as call:
            with self.assertRaisesRegex(RuntimeError, 'one-staged-candidate'): candidate.main(self.space_args(True))
            call.assert_not_called()
        failure = json.loads((self.root/'result.json').read_text())
        self.assertFalse(failure['passed']); self.assertTrue(failure['failedEvidencePreserved'])

    def test_one_candidate_delegates_without_network_or_deployment(self):
        with patch.object(candidate.storage_policy, 'staged_import_space', return_value={'passed': True}) as call:
            self.assertEqual(candidate.main(self.space_args()), 0)
            self.assertEqual(call.call_args.args[0], self.root/'a.json')
        proof = json.loads((self.root/'result.json').read_text())
        self.assertFalse(proof['productionChanged']); self.assertFalse(proof['notificationsSent'])

    def test_failure_receipt_preserves_input_and_cannot_overwrite(self):
        artifact = self.root/'archive'; artifact.write_bytes(b'preserve evidence')
        with patch.object(candidate.storage_policy, 'staged_import_space', side_effect=RuntimeError('test failure')):
            with self.assertRaisesRegex(RuntimeError, 'test failure'): candidate.main(self.space_args())
        original = (self.root/'result.json').read_bytes()
        self.assertEqual(artifact.read_bytes(), b'preserve evidence')
        with self.assertRaisesRegex(RuntimeError, 'fresh-command-receipt'): candidate.main(self.space_args())
        self.assertEqual((self.root/'result.json').read_bytes(), original)

    def test_production_requires_interactions(self):
        args = argparse.Namespace(root=self.root, report='b.json', phase='production', plan_sha256='a'*64,
                                 report_sha256='b'*64, preview_sha256=None, interaction_report=None, interaction_sha256=None)
        with patch.object(candidate.release_browser, 'validate', return_value={'passed': True}):
            with self.assertRaisesRegex(RuntimeError, 'interaction-report-required'): candidate.browser_checks(args)

    def test_retained_failed_report_is_bound_but_not_counted_as_acceptance(self):
        args = self.fixture()
        retained_file = self.root/'browser/retained-console.log'; retained_file.write_bytes(b'')
        retained, digest = self.save('browser/failed.json', {'sourceCommit': '1'*40, 'planSha256': args.plan_sha256,
                          'passed': False, 'boundFilesSha256': {'browser/retained-console.log': guard.sha(b'')}})
        argv = ['pack-browser', '--root', str(self.root), '--plan-sha256', args.plan_sha256,
                '--report', 'browser/production.json', '--report-sha256', '9'*64, '--phase', 'production',
                '--interaction-report', 'browser/interactions.json', '--interaction-sha256', 'a'*64,
                '--bundle', str(self.root/'new.tar.gz'), '--receipt', str(self.root/'pack-proof.json'),
                '--retained-report', 'browser/failed.json', digest]
        with patch.object(candidate.release_browser, 'pack', return_value={'passed': True}) as pack:
            self.assertEqual(candidate.main(argv), 0)
            self.assertFalse(pack.call_args.args[1][-1]['passed'])
        proof = json.loads((self.root/'pack-proof.json').read_text())
        self.assertFalse(proof['retainedReportsUsedForAcceptance'])
        self.assertEqual(proof['retainedReportDigests'], {'browser/failed.json': digest})
        self.assertEqual(retained_file.read_bytes(), b'')

    def test_retained_report_cannot_borrow_other_batch(self):
        args = self.fixture()
        _, digest = self.save('browser/other.json', {'sourceCommit': 'f'*40, 'planSha256': args.plan_sha256,
                                                   'boundFilesSha256': {'browser/before.json': guard.digest(self.root/'browser/before.json')}})
        argv = ['pack-browser', '--root', str(self.root), '--plan-sha256', args.plan_sha256,
                '--report', 'browser/production.json', '--report-sha256', '9'*64, '--phase', 'production',
                '--interaction-report', 'browser/interactions.json', '--interaction-sha256', 'a'*64,
                '--bundle', str(self.root/'new.tar.gz'), '--receipt', str(self.root/'pack-proof.json'),
                '--retained-report', 'browser/other.json', digest]
        with patch.object(candidate.release_browser, 'pack') as pack:
            with self.assertRaisesRegex(RuntimeError, 'same-batch-retained'): candidate.main(argv)
            pack.assert_not_called()


if __name__ == '__main__': unittest.main()
