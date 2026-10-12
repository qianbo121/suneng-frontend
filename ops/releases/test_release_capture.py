import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import release_capture as capture
import release_browser


class CapturePreparation(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.inputs = self.root/'inputs.json'
        contract = {name: {'path': '/zh', 'assertions': ['headingRendered']}
                    for name in sorted(release_browser.HOMES)}
        contract.update({f'view-{n}': {'path': '/en', 'assertions': ['headingRendered']}
                         for n in range(16)})
        references = {}
        for name in capture.DATA:
            value = contract if name == 'browserContract.json' else (
                {key: {} for key in contract} if name == 'browser-assertion-spec.json' else {})
            path = self.root/('input-'+name)
            path.write_text(json.dumps(value))
            references[name] = {'path': str(path), 'sha256': self.sha(path)}
        self.inputs.write_text(json.dumps(references))
        self.plan = self.root/'plan.json'
        self.plan.write_text(json.dumps({'sourceCommit': 'a'*40, 'runtimeImage': 'sha256:'+'b'*64,
            'browserContract': contract, 'browserContractSha256': references['browserContract.json']['sha256']}))

    def sha(self, path):
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def run_prepare(self):
        return capture.prepare(self.root, self.sha(self.plan), self.inputs, self.sha(self.inputs))

    def test_prepares_actual_maintained_sources_and_same_input_is_idempotent(self):
        first = self.run_prepare()
        self.assertTrue(first['prepared'])
        self.assertFalse(first['browserAccepted'])
        source = Path(capture.__file__).with_name('browser')
        for name in capture.COLLECTORS:
            self.assertEqual((self.root/'browser'/name).read_bytes(), (source/name).read_bytes())
        self.assertEqual(first, self.run_prepare())

    def test_existing_evidence_cannot_be_overwritten(self):
        self.run_prepare()
        target = self.root/'browser'/'observe-base.js'
        target.write_text('retained evidence')
        with self.assertRaisesRegex(RuntimeError, 'existing-capture-input-differs'):
            self.run_prepare()
        self.assertEqual(target.read_text(), 'retained evidence')

    def test_bad_external_inputs_digest_stops_before_writes(self):
        with self.assertRaises(RuntimeError):
            capture.prepare(self.root, self.sha(self.plan), self.inputs, 'f'*64)
        self.assertFalse((self.root/'browser').exists())

    def test_changed_referenced_data_stops_before_writes(self):
        (self.root/'input-browserContract.json').write_text('{}')
        with self.assertRaisesRegex(RuntimeError, 'capture-data-digest-mismatch'):
            self.run_prepare()
        self.assertFalse((self.root/'browser').exists())

    def test_symlink_destination_refused(self):
        elsewhere = self.root/'elsewhere'
        elsewhere.mkdir()
        (self.root/'browser').symlink_to(elsewhere, target_is_directory=True)
        with self.assertRaisesRegex(RuntimeError, 'symlink-destination-refused'):
            self.run_prepare()
        self.assertEqual(list(elsewhere.iterdir()), [])

    def test_reduced_plan_contract_refused(self):
        plan = json.loads(self.plan.read_text())
        plan['browserContract'].pop('view-1')
        self.plan.write_text(json.dumps(plan))
        with self.assertRaisesRegex(RuntimeError, 'unchanged-twenty-view-contract-required'):
            self.run_prepare()

    def test_missing_assertion_case_refused(self):
        refs = json.loads(self.inputs.read_text())
        path = Path(refs['browser-assertion-spec.json']['path'])
        data = json.loads(path.read_text())
        data.pop('view-1')
        path.write_text(json.dumps(data))
        refs['browser-assertion-spec.json']['sha256'] = self.sha(path)
        self.inputs.write_text(json.dumps(refs))
        with self.assertRaisesRegex(RuntimeError, 'complete-assertion-spec-required'):
            self.run_prepare()


if __name__ == '__main__':
    unittest.main()
