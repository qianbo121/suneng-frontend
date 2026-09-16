#!/usr/bin/env python3
"""Run the actual SSH preflight in an isolated fixture; never contact production."""
import os
from pathlib import Path
import shlex
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = (ROOT / ".github/workflows/deploy.yml").read_text()
SSH_STEP = WORKFLOW.split("      - name: SSH Deploy\n", 1)[1]
SSH_BODY = SSH_STEP.split("          script: |\n", 1)[1].split("\n      - name:", 1)[0]
SSH_BODY = "\n".join(line[12:] for line in SSH_BODY.splitlines())
PREFLIGHT = SSH_BODY.split("rsync -a", 1)[0]
MOCKS = r'''
flock() { return 0; }
df() {
  echo 'Filesystem 1024-blocks Used Available Capacity Mounted on'
  if [ -e "$TEST_SITE/staged" ]; then free="$TEST_FREE_AFTER"; else free="$TEST_FREE_BEFORE"; fi
  printf 'fixture 99999999 0 %s 0%% /\n' "$free"
}
du() { printf '%s fixture\n' "$TEST_INCOMING_KB"; }
tar() { touch "$TEST_SITE/staged"; }
'''


class DeploymentPreflightTest(unittest.TestCase):
    def run_preflight(self, marker=None, before="20000000", after="20000000",
                      incoming="1000000", env_present=True, dangling=False):
        with tempfile.TemporaryDirectory(prefix="suneng-deploy-guard-test-") as tmp:
            site = Path(tmp)
            if env_present:
                (site / ".env.production").write_text("TEST_ONLY=true\n")
            if marker:
                if dangling:
                    (site / marker).symlink_to(site / "missing-marker-target")
                else:
                    (site / marker).write_text("protected\n")
            sentinel = site / "live-content"
            sentinel.write_text("do not change\n")
            code = PREFLIGHT.replace("/var/lock/corp-site-deploy.lock", str(site / "deploy.lock"))
            code = code.replace("${{ secrets.DEPLOY_PATH }}", shlex.quote(str(site)))
            code = MOCKS + code + '\nprintf "SOURCE_SYNC_ALLOWED\\n"\n'
            result = subprocess.run(["bash", "-c", code], cwd=site, text=True,
                                    capture_output=True, env={**os.environ, "TEST_SITE": str(site),
                                        "TEST_FREE_BEFORE": before, "TEST_FREE_AFTER": after,
                                        "TEST_INCOMING_KB": incoming})
            self.assertEqual(sentinel.read_text(), "do not change\n")
            if marker and not dangling:
                self.assertEqual((site / marker).read_text(), "protected\n")
            return result, (site / "staged").exists()

    def test_pinned_releases_and_hold_block_before_unpack(self):
        for marker in ("verified-images.override.yml", "RELEASE_ARTIFACTS.json", ".DO_NOT_DEPLOY", "DEPLOYMENT_IN_PROGRESS.json"):
            with self.subTest(marker=marker):
                result, staged = self.run_preflight(marker=marker)
                self.assertEqual(result.returncode, 64, result.stderr)
                self.assertFalse(staged)
                self.assertNotIn("SOURCE_SYNC_ALLOWED", result.stdout)

    def test_dangling_release_marker_still_blocks(self):
        result, staged = self.run_preflight(marker="verified-images.override.yml", dangling=True)
        self.assertEqual(result.returncode, 64)
        self.assertFalse(staged)

    def test_missing_environment_blocks_before_unpack(self):
        result, staged = self.run_preflight(env_present=False)
        self.assertEqual(result.returncode, 64)
        self.assertFalse(staged)

    def test_low_space_blocks_before_unpack(self):
        result, staged = self.run_preflight(before="2500000")
        self.assertEqual(result.returncode, 75)
        self.assertFalse(staged)

    def test_space_lost_during_unpack_blocks_before_sync(self):
        result, staged = self.run_preflight(after="5000000")
        self.assertEqual(result.returncode, 75)
        self.assertTrue(staged)
        self.assertNotIn("SOURCE_SYNC_ALLOWED", result.stdout)

    def test_incoming_source_reserves_extra_space(self):
        result, _ = self.run_preflight(after="7000000", incoming="1000000")
        self.assertEqual(result.returncode, 75)
        self.assertNotIn("SOURCE_SYNC_ALLOWED", result.stdout)

    def test_invalid_space_measurement_blocks(self):
        for kwargs in ({"before": "unknown"}, {"after": "unknown"}, {"incoming": "unknown"}):
            with self.subTest(kwargs=kwargs):
                result, _ = self.run_preflight(**kwargs)
                self.assertEqual(result.returncode, 75)

    def test_adequate_space_allows_sync_after_handover(self):
        result, staged = self.run_preflight()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(staged)
        self.assertIn("SOURCE_SYNC_ALLOWED", result.stdout)

    def test_sync_excludes_release_markers(self):
        sync = SSH_BODY.split("rsync -a", 1)[1].split('"$tmp_dir"/ ./', 1)[0]
        for marker in ("verified-images.override.yml", "RELEASE_ARTIFACTS.json", ".DO_NOT_DEPLOY", "DEPLOYMENT_IN_PROGRESS.json"):
            self.assertIn("--exclude='" + marker + "'", sync)

    def test_direct_deploy_blocks_pins_before_git_or_docker(self):
        # Execute only the real pre-pull guards, stopping before the function
        # definition. No git, Docker, production env or network is involved.
        guards = (ROOT / "deploy.sh").read_text().split("\npull_latest() {", 1)[0]
        for marker in ("verified-images.override.yml", "RELEASE_ARTIFACTS.json", "DEPLOYMENT_IN_PROGRESS.json", ".DO_NOT_DEPLOY"):
            with self.subTest(marker=marker), tempfile.TemporaryDirectory() as tmp:
                (Path(tmp) / marker).write_text("protected\n")
                code = "flock() { return 0; }\n" + guards
                result = subprocess.run(["bash", "-c", code], cwd=tmp, capture_output=True,
                                        text=True, env={**os.environ, "DEPLOY_LOCK_HELD": "1"})
                self.assertEqual(result.returncode, 64, result.stderr)
                self.assertIn(marker, result.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
