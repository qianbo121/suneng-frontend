import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import component_lifecycle as lifecycle
import release_retention as retention
import release_storage_status as status
import test_frontend_release as fixtures
from test_frontend_release import RECEIPT, MANIFEST, OLD, GOOD, rows, r


def retired():
    receipt = copy.deepcopy(RECEIPT)
    image = receipt['images'].pop('admin')
    receipt['adminRelease'] = {'image': image, 'expectedCurrentImage': 'sha256:' + '9' * 64}
    receipt['retiredComponents'] = {'admin': {'status': 'retired', 'image': image,
                                            'retiredAt': '2026-10-12T12:00:00+00:00'}}
    return receipt


class LifecycleTest(unittest.TestCase):
    def test_only_explicit_retirement_changes_active_set(self):
        self.assertEqual(lifecycle.active_components(RECEIPT), ('frontend', 'backend', 'admin'))
        self.assertEqual(lifecycle.active_components(retired()), ('frontend', 'backend'))
        missing = copy.deepcopy(RECEIPT)
        del missing['images']['admin']
        with self.assertRaises((RuntimeError, KeyError)):
            r.assert_current(missing, rows(), OLD)

    def test_malformed_or_unknown_retirement_is_rejected(self):
        variants = [ {'backend': {}}, {'admin': {}}, ['admin'] ]
        for value in variants:
            receipt = retired(); receipt['retiredComponents'] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                lifecycle.active_components(receipt)
        receipt = retired(); receipt['images']['admin'] = receipt['adminRelease']['image']
        with self.assertRaises(ValueError): lifecycle.active_components(receipt)

    def test_archived_admin_recovery_stays_protected(self):
        receipt = retired()
        for component in ('frontend', 'backend'):
            receipt[component + 'Release'] = {'image': receipt['images'][component],
                                               'expectedCurrentImage': 'sha256:' + ('7' if component == 'frontend' else '8') * 64}
        protected = retention.boundaries(receipt)
        self.assertEqual(len(protected), 6)
        self.assertIn(receipt['adminRelease']['image'], protected)
        self.assertIn(receipt['adminRelease']['expectedCurrentImage'], protected)

    def test_frontend_preflight_works_without_admin(self):
        with tempfile.TemporaryDirectory() as tmp:
            receipt = retired()
            receipt['frontendRelease'] = {'sourceCommit': MANIFEST['sourceCommit']}
            release = fixtures.ContractTest().fixture(tmp, {**MANIFEST, 'image': OLD}, receipt)
            active = [row for row in rows() if row['Name'] != '/corp-site-admin']
            def inspect(names):
                self.assertNotIn('admin', names)
                return [row for row in active if row['Name'].removeprefix('/corp-site-') in names]
            def image(args, **kwargs):
                return json.dumps([{'Id': OLD, 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])
            with patch.object(r, 'inspect', side_effect=inspect), patch.object(r, 'run', side_effect=image), \
                 patch.object(r, 'probe', return_value=GOOD), patch.object(r, 'public_probe', return_value=[]), \
                 patch.object(r, 'working_space', return_value={'passed': True}):
                result = release.execute(apply=False)
            self.assertTrue(result['passed'])
            self.assertFalse(result['applied'])
            self.assertNotIn('admin', release.target)

    def test_admin_candidate_cannot_reactivate_retired_component(self):
        manifest = {**MANIFEST, 'admin': {'image': 'sha256:'+'4'*64, 'expectedCurrentImage': 'sha256:'+'d'*64, 'archiveSha256': 'f'*64}}
        with tempfile.TemporaryDirectory() as tmp, self.assertRaisesRegex(ValueError, 'owner-retired'):
            fixtures.ContractTest().fixture(tmp, manifest, retired())

    def test_frontend_identity_protection_is_still_required(self):
        active = [row for row in rows('sha256:'+'5'*64) if row['Name'] != '/corp-site-admin']
        with self.assertRaises(RuntimeError): r.assert_current(retired(), active, OLD)

    def test_retirement_status_requires_bound_success_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve(); live=root/'live'; live.mkdir(); archive=root/'records'; archive.mkdir()
            previous=archive/'previous.json'; previous.write_text(json.dumps(RECEIPT))
            operation_path=archive/'result.json'
            receipt=retired(); receipt.update(releaseOperation='retire-admin', previousReceipt=str(previous),
                                             releaseOperationReceipt=str(operation_path))
            operation={'kind':'retire-admin', 'passed':True, 'applied':True, 'images':receipt['images'],
                       'retiredAt':receipt['retiredComponents']['admin']['retiredAt'],
                       'previousReceipt':str(previous), 'previousReceiptSha256':retention.digest(previous.read_bytes())}
            (live/'RELEASE_ARTIFACTS.json').write_text(json.dumps(receipt))
            operation_path.write_text(json.dumps(operation))
            report=status.Status(live, archive).read()
            self.assertEqual(report['status'], 'not-required')
            self.assertFalse(report['needsAttention'])
            operation['passed']=False; operation_path.write_text(json.dumps(operation))
            self.assertEqual(status.Status(live, archive).read()['status'], 'unknown')
            operation['passed']=True; operation_path.write_text(json.dumps(operation)); previous.write_text('{}')
            self.assertEqual(status.Status(live, archive).read()['status'], 'unknown')


if __name__ == '__main__': unittest.main()
