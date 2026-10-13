"""Checks for portable release-evidence redaction, using synthetic identifiers only."""
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from urllib.parse import quote


class SanitizerTests(unittest.TestCase):
    def load_tool(self, token=None):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name) / 'checkout with spaces'
        tool = root / 'ops/releases/browser/sanitize-evidence.py'
        tool.parent.mkdir(parents=True)
        shutil.copyfile(Path(__file__).parent / 'browser/sanitize-evidence.py', tool)
        if token is not None:
            component = root / 'frontend/src/components/seo/ToutiaoAutoSubmit.tsx'
            component.parent.mkdir(parents=True)
            component.write_text('const TOUTIAO_SITE_TOKEN = ' + json.dumps(token) + ';')
        spec = importlib.util.spec_from_file_location('isolated_evidence_sanitizer', tool)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_matching_checkout_source_redacts_bare_identifier(self):
        token = 'synthetic_release_identifier_2030'
        module = self.load_tool(token)
        self.assertEqual(module.redact_text('prefix ' + token + ' suffix'), 'prefix [REDACTED] suffix')

    def test_other_checkout_does_not_supply_identifier(self):
        first = self.load_tool('first_release_identifier_2030')
        second = self.load_tool('second_release_identifier_2030')
        self.assertEqual(first.redact_text('first_release_identifier_2030'), '[REDACTED]')
        self.assertEqual(second.redact_text('first_release_identifier_2030'), 'first_release_identifier_2030')

    def test_percent_encoded_identifier_is_removed(self):
        token = 'synthetic/release+identifier2030'
        module = self.load_tool(token)
        for encoded in (quote(token, safe=''), ''.join('%%%02X' % ord(char) for char in token)):
            with self.subTest(encoded=encoded):
                self.assertEqual(module.redact_text(encoded), '[REDACTED]')

    def test_installed_tools_without_source_keep_generic_protection(self):
        module = self.load_tool()
        raw = json.dumps({'token': 'syntheticvalue2030', 'nested': ['https://example.test/a?token=syntheticvalue2030', 'a' * 128]})
        result = module.safe_output(raw)
        self.assertNotIn('syntheticvalue2030', result)
        self.assertNotIn('a' * 128, result)
        self.assertTrue(module.assert_sanitized(result))

    def test_evidence_hashes_are_preserved(self):
        module = self.load_tool()
        digest = 'a1' * 32
        self.assertEqual(module.redact_text(digest), digest)

    def test_plain_output_and_stderr_are_both_redacted(self):
        token = 'synthetic_release_identifier_2030'
        module = self.load_tool(token)
        result = module.safe_output(token, token)
        self.assertNotIn(token, result)
        self.assertEqual(result.count('[REDACTED]'), 2)

    def test_sanitized_assertion_rejects_known_identifier(self):
        module = self.load_tool('synthetic_release_identifier_2030')
        with self.assertRaises(AssertionError):
            module.assert_sanitized('synthetic_release_identifier_2030')


if __name__ == '__main__':
    unittest.main()
