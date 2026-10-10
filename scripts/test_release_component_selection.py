#!/usr/bin/env python3
"""Check real workflow selection and build commands without building images."""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / '.github/workflows/prepare-release.yml'
SELECTIONS = {
    'frontend': ['frontend'],
    'backend': ['backend'],
    'admin': ['admin'],
    'frontend+backend': ['frontend', 'backend'],
    'frontend+admin': ['frontend', 'admin'],
    'backend+admin': ['backend', 'admin'],
    'frontend+backend+admin': ['frontend', 'backend', 'admin'],
}


def run_step(workflow, name):
    """Read one literal run block so tests execute the workflow's actual shell."""
    step = workflow.split('      - name: ' + name + '\n', 1)[1]
    step = step.split('\n      - ', 1)[0]
    block = step.split('        run: |\n', 1)[1]
    lines = []
    for line in block.splitlines():
        if line and not line.startswith('          '):
            break
        lines.append(line[10:] if line else '')
    return '\n'.join(lines) + '\n'


class ComponentSelectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workflow = WORKFLOW.read_text()
        cls.select = run_step(cls.workflow, 'Validate explicit release components')
        cls.build = run_step(cls.workflow, 'Build candidate outside production')

    def select_components(self, selection):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'outputs'
            env = dict(os.environ, RELEASE_COMPONENTS=selection, GITHUB_OUTPUT=str(output))
            result = subprocess.run(['bash', '-c', self.select], env=env,
                                    capture_output=True, text=True, timeout=10)
            text = output.read_text() if output.exists() else ''
        return result, text

    def test_frontend_default_and_exact_choices(self):
        inputs = self.workflow.split('      components:\n', 1)[1].split('      segmented_archive:', 1)[0]
        self.assertIn('        type: choice\n', inputs)
        self.assertIn('        default: frontend\n', inputs)
        self.assertEqual(re.findall(r'^          - (.+)$', inputs, re.M), list(SELECTIONS))
        result, output = self.select_components('frontend')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(output.removeprefix('matrix=')), {'component': ['frontend']})

    def test_all_explicit_combinations_have_nonempty_fixed_matrix(self):
        for selection, expected in SELECTIONS.items():
            with self.subTest(selection=selection):
                result, output = self.select_components(selection)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(output.removeprefix('matrix=')), {'component': expected})

    def test_empty_unknown_duplicate_and_shell_input_are_rejected(self):
        invalid = ['', 'all', 'unknown', 'frontend,backend', 'frontend+frontend',
                   'backend+frontend', 'frontend ', '../backend', 'frontend\nadmin',
                   'frontend; echo injected', '$(echo frontend)', '${frontend}']
        for selection in invalid:
            with self.subTest(selection=selection):
                result, output = self.select_components(selection)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(output, '')

    def test_candidate_consumes_validated_matrix_and_keeps_source_guards(self):
        self.assertIn('      matrix: ${{ steps.select.outputs.matrix }}\n', self.workflow)
        candidate = self.workflow.split('  candidate:\n', 1)[1]
        self.assertIn('    needs: selection\n', candidate)
        self.assertIn('      matrix: ${{ fromJSON(needs.selection.outputs.matrix) }}\n', candidate)
        self.assertIn('      COMPONENT: ${{ matrix.component }}\n', candidate)
        self.assertNotIn('component: [frontend, backend]', candidate)
        for guard in ['[[ "$SOURCE_COMMIT" =~ ^[0-9a-f]{40}$ ]]',
                      'test "$(git rev-parse HEAD)" = "$SOURCE_COMMIT"',
                      'test "$passed" = "$SOURCE_COMMIT"',
                      "TECHNICAL_CONTENT_PUBLISHED = false",
                      'bash scripts/check-no-secrets.sh', 'archiveSha256',
                      "'status': 'candidate-not-deployed'", 'serverCanaryRequired']:
            self.assertIn(guard, candidate)
        self.assertIn('name: release-${{ matrix.component }}-${{ inputs.source_commit }}', candidate)
        self.assertIn('path: ${{ runner.temp }}/release-${{ matrix.component }}/', candidate)

    def build_component(self, component):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'scripts').mkdir()
            (root / 'scripts/check-no-secrets.sh').write_text('exit 0\n')
            docker = root / 'docker'
            docker.write_text('#!/usr/bin/env python3\nimport json, sys\nprint(json.dumps(sys.argv[1:]))\n')
            docker.chmod(0o755)
            env = dict(os.environ, PATH=str(root) + os.pathsep + os.environ['PATH'],
                       COMPONENT=component, SOURCE_COMMIT='a' * 40,
                       IMAGE_TAG='suneng-verified-' + component + ':' + 'a' * 40)
            for name in ['BAIDU_TONGJI_ID', 'BAIDU_SITE_VERIFICATION', 'BING_SITE_VERIFICATION',
                         '360_SITE_VERIFICATION', 'SOGOU_SITE_VERIFICATION']:
                env['NEXT_PUBLIC_' + name] = 'test-value'
            result = subprocess.run(['bash', '-c', self.build], cwd=root, env=env,
                                    capture_output=True, text=True, timeout=10)
        return result

    def test_builds_use_fixed_module_and_compatible_arguments(self):
        for component in ['frontend', 'backend', 'admin']:
            with self.subTest(component=component):
                result = self.build_component(component)
                self.assertEqual(result.returncode, 0, result.stderr)
                arguments = json.loads(result.stdout)
                self.assertEqual(arguments[:3], ['build', '--platform', 'linux/amd64'])
                self.assertEqual(arguments[arguments.index('-f') + 1], component + '/Dockerfile')
                self.assertIn('org.opencontainers.image.revision=' + 'a' * 40, arguments)
                self.assertIn('suneng-verified-' + component + ':' + 'a' * 40, arguments)
                if component == 'admin':
                    self.assertIn('VITE_APP_BASE_PATH=/', arguments)
                    self.assertIn('VITE_API_BASE_URL=/api', arguments)
                    self.assertFalse(any(arg.startswith('NEXT_PUBLIC_') for arg in arguments))
                else:
                    self.assertIn('NEXT_PUBLIC_SITE_URL=https://www.jssngyl.cn', arguments)
                    self.assertIn('API_BASE_URL_INTERNAL=http://backend:3001/api', arguments)
                    self.assertEqual('NEXT_PUBLIC_BAIDU_TONGJI_ID=test-value' in arguments,
                                     component == 'frontend')

    def test_admin_candidate_identity_remains_import_compatible(self):
        metadata = run_step(self.workflow, 'Record immutable artifact identity')
        source = metadata.split("python3 - <<'PY'\n", 1)[1].split('\nPY', 1)[0]
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory) / 'release-admin'
            folder.mkdir()
            (folder / 'admin.tar.gz').write_bytes(b'fixture-only')
            (folder / 'image.json').write_text(json.dumps([{
                'Id': 'sha256:' + 'b' * 64, 'RootFS': {'Layers': ['sha256:' + 'c' * 64]}, 'Size': 12,
            }]))
            env = dict(os.environ, RUNNER_TEMP=directory, COMPONENT='admin',
                       SOURCE_COMMIT='a' * 40, IMAGE_TAG='suneng-verified-admin:' + 'a' * 40,
                       SEGMENTED_ARCHIVE='false')
            result = subprocess.run(['python3', '-c', source], cwd=ROOT, env=env,
                                    capture_output=True, text=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            receipt = json.loads((folder / 'candidate.json').read_text())
            self.assertEqual(receipt['component'], 'admin')
            self.assertEqual(receipt['status'], 'candidate-not-deployed')
            self.assertEqual(receipt['sourceCommit'], 'a' * 40)
            self.assertEqual(receipt['buildImageId'], 'sha256:' + 'b' * 64)
            self.assertEqual(len(receipt['archiveSha256']), 64)
            self.assertTrue(receipt['serverCanaryRequired'])
            self.assertTrue(receipt['browserAcceptanceRequired'])
            self.assertNotIn('approvedGuides', receipt)
            self.assertFalse((folder / 'image.json').exists())

    def test_unvalidated_component_cannot_build(self):
        result = self.build_component('frontend+backend')
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, '')


if __name__ == '__main__':
    unittest.main()
