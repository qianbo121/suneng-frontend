#!/usr/bin/env python3
"""Exercise screenshot selection against real temporary Git trees and renames."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name('visual-check-scope.py')
SPEC = importlib.util.spec_from_file_location('visual_check_scope', SCRIPT)
scope = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = scope
SPEC.loader.exec_module(scope)

LOGIC = 'frontend/src/lib/analytics/traffic-source.ts'
COLLECTOR = 'frontend/src/components/analytics/WebsiteReadingTracker.tsx'
UI = 'frontend/src/components/Header.tsx'


class VisualScopeTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='visual-scope-')
        self.addCleanup(self.directory.cleanup)
        self.repo = Path(self.directory.name)
        self.git('init', '-q')
        self.git('config', 'user.email', 'visual-scope-fixture@example.invalid')
        self.git('config', 'user.name', 'Visual scope fixture')
        self.git('config', 'commit.gpgsign', 'false')
        for path in scope.REQUIRED_BASELINES:
            self.write(path, b'fixture screenshot')
        self.write(LOGIC, 'export const value = 1;\n')
        self.write(UI, 'export const Header = () => <header />;\n')
        self.write(COLLECTOR, 'export const WebsiteReadingTracker = () => null;\n')
        self.base = self.commit('baseline fixture')

    def git(self, *args):
        return subprocess.check_output(['git', '-C', str(self.repo), *args],
                                       stderr=subprocess.PIPE, text=True)

    def write(self, path, content):
        target = self.repo / path
        target.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, bytes):
            target.write_bytes(content)
        else:
            target.write_text(content)

    def commit(self, title):
        self.git('add', '--all')
        self.git('commit', '-q', '-m', title)
        return self.git('rev-parse', 'HEAD').strip()

    def classified(self, head, base=None, event='pull_request'):
        return scope.classify(self.repo, self.base if base is None else base, head, event)

    def test_reviewed_logic_and_its_test_skip_only_screenshots(self):
        self.write(LOGIC, 'export const value = 2;\n')
        self.write('frontend/src/lib/analytics/traffic-source.spec.ts', 'test("source");\n')
        result = self.classified(self.commit('analytics only'))
        self.assertFalse(result.required)
        self.assertEqual(result.changed_paths, 2)
        self.assertIn('unit tests and builds still run', result.reason)

    def test_one_ui_change_makes_a_mixed_change_full(self):
        self.write(LOGIC, 'export const value = 2;\n')
        self.write(UI, 'export const Header = () => <nav />;\n')
        result = self.classified(self.commit('analytics plus UI'))
        self.assertTrue(result.required)
        self.assertEqual(result.changed_paths, 2)

    def test_unknown_typescript_admin_utilities_and_null_collector_are_full(self):
        for path in ('frontend/src/lib/new-helper.ts', 'admin/src/lib/report.ts', COLLECTOR):
            with self.subTest(path=path):
                self.git('reset', '--hard', self.base)
                self.git('clean', '-fd')
                self.write(path, 'export const changed = true;\n')
                self.assertTrue(self.classified(self.commit('unreviewed source')).required)

    def test_configuration_assets_dependencies_and_visual_tests_are_full(self):
        for path in ('frontend/src/app/globals.css', 'frontend/public/images/example.png',
                     'pnpm-lock.yaml', 'frontend/next.config.mjs', '.github/workflows/ci.yml',
                     'frontend/tests/visual/smoke-pages.spec.ts', 'scripts/visual-check-scope.py'):
            with self.subTest(path=path):
                self.git('reset', '--hard', self.base)
                self.git('clean', '-fd')
                self.write(path, 'changed\n')
                self.assertTrue(self.classified(self.commit('visual sensitive')).required)

    def test_baseline_missing_at_either_commit_is_full(self):
        baseline = self.repo / (scope.BASELINE_PREFIX + 'home-mobile-390.png')
        baseline.unlink()
        missing = self.commit('missing baseline')
        self.write(LOGIC, 'export const value = 2;\n')
        self.assertTrue(self.classified(self.commit('logic with missing head baseline')).required)
        self.write(baseline.relative_to(self.repo), b'fixture screenshot')
        restored = self.commit('restore baseline')
        self.assertTrue(self.classified(restored, base=missing).required)

    def test_baseline_symlink_is_full(self):
        path = self.repo / (scope.BASELINE_PREFIX + 'home-mobile-390.png')
        path.unlink()
        path.symlink_to('home-desktop-1440.png')
        self.assertTrue(self.classified(self.commit('invalid baseline mode')).required)

    def test_delete_or_rename_unreviewed_path_is_full(self):
        (self.repo / UI).unlink()
        self.assertTrue(self.classified(self.commit('delete UI')).required)
        self.git('reset', '--hard', self.base)
        renamed = 'frontend/src/lib/analytics/new-source.ts'
        self.git('mv', LOGIC, renamed)
        result = self.classified(self.commit('rename out of reviewed paths'))
        self.assertTrue(result.required)
        self.assertEqual(result.changed_paths, 2)

    def test_rename_from_unreviewed_to_reviewed_path_is_full(self):
        approved_test = 'frontend/src/lib/analytics/traffic-source.spec.ts'
        self.git('mv', UI, approved_test)
        result = self.classified(self.commit('rename into reviewed paths'))
        self.assertTrue(result.required)
        self.assertEqual(result.changed_paths, 2)

    def test_allowlisted_file_becoming_symlink_is_full(self):
        path = self.repo / LOGIC
        path.unlink()
        path.symlink_to('traffic-source.spec.ts')
        self.assertTrue(self.classified(self.commit('replace logic with symlink')).required)

    def test_push_compares_all_commits_instead_of_last_parent(self):
        self.write(UI, 'export const Header = () => <nav />;\n')
        self.commit('UI in first pushed commit')
        self.write(LOGIC, 'export const value = 2;\n')
        head = self.commit('analytics in final pushed commit')
        result = self.classified(head, event='push')
        self.assertTrue(result.required)
        self.assertEqual(result.changed_paths, 2)

    def test_pr_compares_merge_checkout_tree_with_explicit_base(self):
        base_branch = self.git('branch', '--show-current').strip()
        self.git('checkout', '-q', '-b', 'feature-fixture')
        self.write(LOGIC, 'export const value = 2;\n')
        feature = self.commit('feature analytics')
        self.git('checkout', '-q', base_branch)
        self.write(UI, 'export const Header = () => <nav />;\n')
        new_base = self.commit('base UI change')
        self.git('merge', '-q', '--no-ff', 'feature-fixture', '-m', 'actual merge checkout')
        merge = self.git('rev-parse', 'HEAD').strip()
        self.assertFalse(self.classified(merge, base=new_base).required)
        self.assertTrue(self.classified(merge, base=self.base).required)
        self.assertTrue(self.classified(feature, base=new_base).required)

    def test_invalid_missing_blob_zero_or_empty_comparison_is_full(self):
        blob = self.git('rev-parse', f'HEAD:{LOGIC}').strip()
        for base in ('', '0' * 40, 'f' * 40, 'HEAD~1', '--help', blob):
            with self.subTest(base=base):
                self.assertTrue(self.classified(self.base, base=base).required)
        self.assertTrue(self.classified(self.base).required)
        self.assertTrue(self.classified(self.base, event='workflow_dispatch').required)

    def test_tabs_and_newlines_in_paths_do_not_hide_unreviewed_changes(self):
        self.write(LOGIC, 'export const value = 2;\n')
        self.write('frontend/src/lib/not-reviewed\tname\n.ts', 'changed\n')
        result = self.classified(self.commit('unusual filename'))
        self.assertTrue(result.required)
        self.assertEqual(result.changed_paths, 2)

    def test_cli_writes_explicit_output_and_summary(self):
        self.write(LOGIC, 'export const value = 2;\n')
        head = self.commit('analytics CLI fixture')
        output, summary = self.repo / 'output.txt', self.repo / 'summary.md'
        result = subprocess.check_output([
            sys.executable, str(SCRIPT), '--repository', str(self.repo),
            '--base', self.base, '--head', head, '--event', 'push',
            '--github-output', str(output), '--summary', str(summary),
        ], text=True)
        self.assertFalse(json.loads(result)['required'])
        self.assertIn('required=false\n', output.read_text())
        self.assertIn('Screenshots skipped:', summary.read_text())


if __name__ == '__main__':
    unittest.main()
