import json
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import release_closeout as c
import release_retention as r
import test_release_retention as fixtures

ident = fixtures.ident


class CloseoutTest(unittest.TestCase):
    setUp = fixtures.RetentionTest.setUp
    change_acceptance = fixtures.RetentionTest.change_acceptance

    def runner(self):
        return c.Closeout(self.plan, self.acceptance, self.root, self.engine)

    def preview(self):
        output = self.audit / 'closeout-preview'
        result = self.runner().run(output)
        self.assertTrue(result['passed'])
        return output / 'preflight.json'

    def test_default_is_readonly_and_persists_real_preflight(self):
        before = self.engine.images()
        preflight = self.preview()
        value = json.loads(preflight.read_text())
        self.assertFalse(value['applied'])
        self.assertEqual(value['snapshotSha256'], r.digest(c.canonical(value['snapshot'])))
        self.assertEqual(value['result']['targets'], [{'component': 'frontend', 'image': ident(1)}])
        self.assertEqual(self.engine.images(), before)
        self.assertEqual(self.engine.removed, [])
        self.assertEqual(list(self.audit.glob('retention-*/result.json')), [])
        self.assertTrue((preflight.parent / 'closeout-result.json').is_file())

    def test_apply_requires_reviewed_preflight_before_creating_output(self):
        output = self.audit / 'closeout-apply'
        with self.assertRaises(ValueError):
            self.runner().run(output, apply=True)
        self.assertFalse(output.exists())
        self.assertEqual(self.engine.removed, [])

    def test_success_keeps_original_result_and_owned_durable_receipt(self):
        output = self.audit / 'closeout-apply'
        result = self.runner().run(output, apply=True, reviewed_preflight=self.preview())
        self.assertTrue(result['passed'])
        self.assertEqual(result['deletedImageCount'], 1)
        self.assertEqual(result['removed'], [ident(1)])
        self.assertEqual(self.engine.removed, [ident(1)])
        native_bytes = r.read_file(result['nativeResult'], self.root)
        self.assertEqual(result['nativeResultSha256'], r.digest(native_bytes))
        self.assertEqual(json.loads(native_bytes), json.loads((output / 'retention-result.json').read_text()))
        self.assertEqual(json.loads((output / 'closeout-result.json').read_text()), result)
        for number in [2, 3, 4, 5, 6, 7, 20]:
            self.assertIn(ident(number), self.engine.records)

    def test_changed_inventory_config_or_protection_stops_before_remove(self):
        preflight = self.preview()
        for kind in ['image', 'container', 'configuration', 'protection']:
            with self.subTest(kind=kind):
                original = self.engine.images()
                rows = self.engine.containers()
                config = self.live / 'custom.yaml'
                pins = self.live / 'RETENTION_PROTECTED_IMAGES.json'
                if kind == 'image':
                    self.engine.add('other-app', 21)
                elif kind == 'container':
                    self.engine.rows[0]['started'] = 'restarted'
                elif kind == 'configuration':
                    config.write_text('unrelated_setting: changed')
                else:
                    r.write_json(pins, [ident(20)])
                output = self.audit / ('closeout-' + kind)
                with self.assertRaises(ValueError):
                    self.runner().run(output, apply=True, reviewed_preflight=preflight)
                self.assertFalse(json.loads((output / 'closeout-result.json').read_text())['passed'])
                self.assertEqual(self.engine.removed, [])
                self.engine.records, self.engine.rows = original, rows
                config.unlink(missing_ok=True)
                pins.unlink(missing_ok=True)

    def test_missing_real_browser_evidence_fails_and_records_failure(self):
        (self.audit / 'browser.txt').unlink()
        output = self.audit / 'closeout-missing-evidence'
        with self.assertRaises(ValueError):
            self.runner().run(output)
        self.assertEqual(self.engine.removed, [])
        self.assertFalse(json.loads((output / 'closeout-result.json').read_text())['passed'])
        self.assertFalse((output / 'preflight.json').exists())

    def test_modified_preflight_or_tool_identity_is_rejected(self):
        original = self.preview()
        value = json.loads(original.read_text())
        for kind in ['hash', 'tool', 'retention-tool', 'apply', 'plan']:
            changed = dict(value)
            if kind == 'hash':
                changed['snapshotSha256'] = '0' * 64
            elif kind == 'tool':
                changed['toolSha256'] = '0' * 64
            elif kind == 'retention-tool':
                changed['retentionToolSha256'] = '0' * 64
            elif kind == 'apply':
                changed['applied'] = True
            else:
                changed['plan'] = str(self.audit / 'some-other-plan.json')
            edited = self.audit / ('modified-' + kind + '.json')
            r.write_json(edited, changed)
            with self.assertRaises(ValueError):
                self.runner().run(self.audit / ('closeout-modified-' + kind), True, edited)
            self.assertEqual(self.engine.removed, [])

    def test_output_must_be_unique_canonical_and_inside_records_root(self):
        preflight = self.preview()
        before = preflight.read_bytes()
        with self.assertRaises(FileExistsError):
            self.runner().run(preflight.parent)
        self.assertEqual(preflight.read_bytes(), before)
        link = self.root / 'linked'
        link.symlink_to(self.audit, target_is_directory=True)
        for output in [link / 'closeout', self.audit / '..' / 'unsafe', self.root.parent / 'outside-closeout']:
            with self.subTest(output=output), self.assertRaises(ValueError):
                self.runner().run(output)
        self.assertEqual(self.engine.removed, [])

    def test_state_change_between_apply_initial_read_and_delete_stops(self):
        preflight = self.preview()
        calls, original = [0], self.engine.images

        def changing_images():
            calls[0] += 1
            if calls[0] == 3:
                self.engine.add('other-app', 21)
            return original()

        self.engine.images = changing_images
        output = self.audit / 'closeout-midflight-change'
        with self.assertRaises(RuntimeError):
            self.runner().run(output, True, preflight)
        self.assertEqual(self.engine.removed, [])
        own = json.loads((output / 'closeout-result.json').read_text())
        raw = json.loads((output / 'retention-result.json').read_text())
        self.assertFalse(own['passed'])
        self.assertFalse(raw['passed'])
        self.assertTrue(Path(own['nativeResult']).is_file())

    def test_failure_keeps_original_failure_and_never_reports_success(self):
        preflight = self.preview()

        def fail(_):
            raise RuntimeError('simulated Docker removal failure')

        self.engine.on_remove = fail
        output = self.audit / 'closeout-removal-failed'
        with self.assertRaises(RuntimeError):
            self.runner().run(output, True, preflight)
        own = json.loads((output / 'closeout-result.json').read_text())
        raw = json.loads((output / 'retention-result.json').read_text())
        self.assertEqual(own['status'], 'failed')
        self.assertFalse(own['passed'])
        self.assertFalse(raw['passed'])
        self.assertEqual(raw['removed'], [])
        self.assertIn(ident(2), self.engine.records)

    def test_zero_deletion_is_not_reported_as_reclaimed_space(self):
        self.engine.records.pop(ident(1))
        preflight = self.preview()
        with patch.object(r.shutil, 'disk_usage', side_effect=[SimpleNamespace(free=100), SimpleNamespace(free=150)]):
            result = self.runner().run(self.audit / 'closeout-no-targets', True, preflight)
        self.assertTrue(result['passed'])
        self.assertEqual(result['status'], 'no-images-to-retire')
        self.assertEqual(result['deletedImageCount'], 0)
        self.assertEqual(result['reclaimedBytes'], 0)
        self.assertEqual(result['observedFreeBytesChange'], 50)
        self.assertEqual(self.engine.removed, [])

    def test_final_state_failure_preserves_raw_success_but_fails_closeout(self):
        preflight = self.preview()
        original = self.engine.containers
        calls = [0]

        def changed_final_configuration():
            calls[0] += 1
            if calls[0] == 5:
                (self.live / 'changed-final.yaml').write_text('setting: changed')
            return original()

        self.engine.containers = changed_final_configuration
        output = self.audit / 'closeout-final-state-changed'
        with self.assertRaises(RuntimeError):
            self.runner().run(output, True, preflight)
        own = json.loads((output / 'closeout-result.json').read_text())
        raw = json.loads((output / 'retention-result.json').read_text())
        self.assertFalse(own['passed'])
        self.assertTrue(raw['passed'])
        self.assertEqual(self.engine.removed, [ident(1)])


if __name__ == '__main__':
    unittest.main(verbosity=2)
