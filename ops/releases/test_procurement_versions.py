"""Exact content approvals across preparation, replacement and old-image recovery."""
import copy
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import procurement_approval as approval
import approved_procurement_continuity as continuity
import test_frontend_release as fixture

r = fixture.r
ROOT = Path(__file__).resolve().parents[2]
OLD_APPROVAL = approval.APPROVAL_SHA256
NEW_APPROVAL = approval.CURRENT_APPROVAL_SHA256
PATHS = approval.APPROVED_PATHS
SOURCE_FILES = [
    'frontend/src/lib/approved-procurement-pages.ts',
    'frontend/src/lib/publication-scope.ts',
    'frontend/src/app/[locale]/articles/special-industrial-furnace-procurement-assessment/page.tsx',
    'frontend/src/app/[locale]/service/industrial-furnace-parts-purchasing/page.tsx',
]


class ProcurementApprovalVersionTest(unittest.TestCase):
    def copy_source(self, destination):
        for relative in SOURCE_FILES:
            output = destination / relative
            output.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, output)

    def test_historical_record_is_unchanged_and_current_scope_is_not_widened(self):
        self.assertEqual(hashlib.sha256(approval.APPROVAL_FILE.read_bytes()).hexdigest(), OLD_APPROVAL)
        old = approval.approval_document(OLD_APPROVAL)
        new = approval.approval_document(NEW_APPROVAL)
        self.assertEqual([p['path'] for p in old['pages']], PATHS)
        self.assertEqual([p['path'] for p in new['pages']], PATHS)
        self.assertEqual(sum(len(p['anchors']) for p in old['pages']), 9)
        self.assertEqual(sum(len(p['anchors']) for p in new['pages']), 20)
        self.assertFalse(new['approvalSource']['deploymentAuthorized'])
        self.assertEqual(len(r.APPROVED_GUIDES), 11)

    def test_new_source_requires_exact_new_approval_and_defaults_to_it(self):
        self.assertEqual(approval.procurement_candidate_fields(ROOT), {
            approval.SCOPE_FIELD: PATHS, 'procurementApprovalSha256': NEW_APPROVAL,
        })
        with self.assertRaisesRegex(ValueError, 'source body or anchor'):
            approval.procurement_candidate_fields(ROOT, OLD_APPROVAL)
        for value in ['0' * 64, {'approved': True}, '', NEW_APPROVAL + ' ']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                approval.procurement_candidate_fields(ROOT, value)

    def test_modified_body_or_anchor_cannot_borrow_either_approval(self):
        for change in ['body', 'anchor']:
            with self.subTest(change=change), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                self.copy_source(root)
                path = root / SOURCE_FILES[0]
                text = path.read_text()
                start = text.index('export const approvedProcurementPages = ') + len('export const approvedProcurementPages = ')
                end = text.index(' as const;', start)
                pages = json.loads(text[start:end])
                page = next(iter(pages.values()))
                page['html'] = (page['html'] + '<p>未经批准的新内容</p>' if change == 'body'
                                else page['html'].replace('gas-furnace-assessment', 'forged-anchor', 1))
                page['sha256'] = hashlib.sha256(page['html'].encode()).hexdigest()
                path.write_text(text[:start] + json.dumps(pages, ensure_ascii=False, indent=2) + text[end:])
                for selected in [OLD_APPROVAL, NEW_APPROVAL]:
                    with self.subTest(selected=selected), self.assertRaises(ValueError):
                        approval.procurement_candidate_fields(root, selected)

    def test_record_or_human_evidence_edits_are_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'changed.json'
            for record_file, field in [(approval.APPROVAL_FILE, 'APPROVAL_FILE'),
                                       (approval.CURRENT_APPROVAL_FILE, 'CURRENT_APPROVAL_FILE'),
                                       (approval.AUTHORIZATION_FILE, 'AUTHORIZATION_FILE')]:
                path.write_bytes(record_file.read_bytes() + b' ')
                selected = OLD_APPROVAL if field == 'APPROVAL_FILE' else NEW_APPROVAL
                with self.subTest(field=field), patch.object(approval, field, path), self.assertRaises(ValueError):
                    approval.normalize_procurement(PATHS, selected, require_approval=True)

    def test_rendered_bodies_cannot_pass_the_other_versions_fingerprint(self):
        source = (ROOT / SOURCE_FILES[0]).read_text()
        pages = json.loads(source.split('export const approvedProcurementPages = ', 1)[1].split(' as const;', 1)[0])
        old = approval.approval_document(OLD_APPROVAL)
        new = approval.approval_document(NEW_APPROVAL)
        payload = {'old': old['pages'], 'new': new['pages'], 'source': list(pages.values())}
        script = r'''
        const fs = require('node:fs');
        const checker = require('./ops/releases/approved-procurement-continuity.cjs');
        const input = JSON.parse(fs.readFileSync(0, 'utf8'));
        const rows = input.source.map((source, i) => {
          const html = '<h1>'+source.heading+'</h1><div id="'+input.new[i].bodyId+'"><div>'+source.html+'</div></div>';
          return {old: checker.inspectApprovedPage(html, input.old[i], {}).checks.body,
                  current: checker.inspectApprovedPage(html, input.new[i], {}).checks.body};
        });
        console.log(JSON.stringify(rows));
        '''
        result = subprocess.run(['node', '-e', script], cwd=ROOT, input=json.dumps(payload),
                                capture_output=True, text=True, timeout=15)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout), [{'old': False, 'current': True}] * 2)

    def test_actual_probe_selects_the_record_and_records_its_hash(self):
        for selected in [OLD_APPROVAL, NEW_APPROVAL]:
            pages = approval.approval_document(selected)['pages']
            report = {'baseUrl': continuity.CANDIDATE_ORIGIN, 'canonicalOrigin': continuity.PUBLIC_ORIGIN,
                      'passed': True, 'pagesChecked': 2,
                      'pages': [{'path': p['path'], 'status': 200, 'passed': True,
                                 'contentStreamSha256': p['contentStreamSha256'],
                                 'checks': {key: {'passed': True} for key in continuity.REQUIRED}} for p in pages]}
            with self.subTest(selected=selected), patch.object(continuity.subprocess, 'run',
                    return_value=subprocess.CompletedProcess([], 0, json.dumps(report))) as command:
                actual = continuity.approved_procurement_probe('candidate', PATHS, approval_sha=selected)
            self.assertEqual(actual['procurementApprovalSha256'], selected)
            self.assertIn(json.dumps({'baseUrl': continuity.CANDIDATE_ORIGIN, 'pages': pages}), command.call_args.kwargs['input'])

    def test_old_to_new_saves_current_approval_after_actual_versioned_checks(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, result, _ = fixture.SeparateProcurementReleaseTest().perform(
                tmp, previous=PATHS, previous_approval=OLD_APPROVAL, target_approval=NEW_APPROVAL)
            self.assertEqual(state['image'], fixture.NEW)
            self.assertEqual([c.kwargs['approval_sha'] for c in calls], [NEW_APPROVAL, NEW_APPROVAL])
            self.assertEqual(json.loads(release.receipt_path.read_text())['frontendRelease']['procurementApprovalSha256'], NEW_APPROVAL)
            self.assertEqual(result['publicApprovedProcurement']['procurementApprovalSha256'], NEW_APPROVAL)

    def test_new_body_failure_recovers_old_image_with_old_body_contract(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, _, original = fixture.SeparateProcurementReleaseTest().perform(
                tmp, previous=PATHS, previous_approval=OLD_APPROVAL, target_approval=NEW_APPROVAL, failure='public-once')
            self.assertEqual(state['image'], fixture.OLD)
            self.assertEqual([c.kwargs['approval_sha'] for c in calls], [NEW_APPROVAL, NEW_APPROVAL, OLD_APPROVAL])
            self.assertEqual(json.loads(release.receipt_path.read_text()), original)
            result = json.loads((release.audit / 'result.json').read_text())
            self.assertEqual(result['previousApprovedProcurement']['procurementApprovalSha256'], OLD_APPROVAL)
            self.assertTrue(result['previousFrontendRestoredAndVerified'])

    def test_explicit_old_rollback_from_new_checks_and_saves_old_approval(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, _, calls, _, _ = fixture.SeparateProcurementReleaseTest().perform(
                tmp, previous=PATHS, previous_approval=NEW_APPROVAL, target_approval=OLD_APPROVAL, kind='rollback')
            self.assertEqual([c.kwargs['approval_sha'] for c in calls], [OLD_APPROVAL, OLD_APPROVAL])
            self.assertEqual(json.loads(release.receipt_path.read_text())['frontendRelease']['procurementApprovalSha256'], OLD_APPROVAL)

    def test_preflight_keeps_new_candidate_separate_from_old_live_body(self):
        with tempfile.TemporaryDirectory() as tmp:
            _, state, calls, _, _ = fixture.SeparateProcurementReleaseTest().perform(
                tmp, previous=PATHS, target_approval=NEW_APPROVAL, apply=False)
            self.assertEqual(state['switches'], [])
            self.assertEqual([c.kwargs['approval_sha'] for c in calls], [NEW_APPROVAL, OLD_APPROVAL])

    def test_component_only_release_keeps_actual_frontend_approval(self):
        for selected in [OLD_APPROVAL, NEW_APPROVAL]:
            with self.subTest(selected=selected), tempfile.TemporaryDirectory() as tmp:
                original = copy.deepcopy(fixture.RECEIPT)
                original['frontendRelease'] = {'sourceCommit': '1' * 40, r.SCOPE_FIELD: PATHS,
                                              'procurementApprovalSha256': selected}
                manifest = {**fixture.BackendOnlyReleaseTest().manifest(), r.SCOPE_FIELD: PATHS,
                            'procurementApprovalSha256': NEW_APPROVAL}
                release = fixture.ContractTest().fixture(tmp, manifest, original)
                state = dict(original['images'])
                def current(names):
                    rows = fixture.rows()
                    for row in rows:
                        name = row['Name'].removeprefix('/corp-site-')
                        row.update(Image=state.get(name, row['Image']))
                    return [row for row in rows if row['Name'].removeprefix('/corp-site-') in names]
                def switch(_=None):
                    state['backend'] = fixture.OTHER
                with patch.object(r, 'working_space', return_value={'passed': True}), \
                     patch.object(r, 'inspect', side_effect=current), \
                     patch.object(r, 'run', side_effect=fixture.BackendOnlyReleaseTest().image), \
                     patch.object(r, 'probe', return_value=fixture.GOOD), patch.object(r, 'public_probe', return_value=[]), \
                     patch.object(release, 'backend_check', return_value={'passed': True, 'pendingMigrationCount': 0, 'aggregateAvailable': True}), \
                     patch.object(release, 'replace_frontend', side_effect=switch), \
                     patch.object(r, 'approved_procurement_probe', return_value={'passed': True}) as gate:
                    self.assertTrue(release.execute(True)['applied'])
                self.assertTrue(all(c.kwargs['approval_sha'] == selected for c in gate.call_args_list))
                self.assertEqual(json.loads(release.receipt_path.read_text())['frontendRelease'], original['frontendRelease'])
                self.assertEqual(state['frontend'], fixture.OLD)


if __name__ == '__main__':
    unittest.main()
