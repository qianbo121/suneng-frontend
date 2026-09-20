#!/usr/bin/env python3
"""Run the real backup.sh against a fixture directory; never contact production.

`docker` and `curl` are replaced by stand-ins on PATH, so the script's own
control flow runs unchanged while the dump content and the alert channel are
under the test's control.
"""
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import time
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "backup.sh"
WEBHOOK = "https://alerts.invalid/hook/SECRET-TOKEN-0f3a"
DAY = 24 * 60 * 60

FAKE_DOCKER = r'''#!/usr/bin/env bash
touch "$FAKE_STATE/docker-called"
if [ "${FAKE_DUMP_EXIT:-0}" != "0" ]; then
  echo "pg_dump: error: connection to server failed" >&2
  exit "$FAKE_DUMP_EXIT"
fi
i=0
while [ "$i" -lt "${FAKE_TABLES:-28}" ]; do
  echo "CREATE TABLE public.t$i (id integer);"
  i=$((i + 1))
done
if [ "${FAKE_PAD_LINES:-0}" -gt 0 ]; then
  awk -v n="$FAKE_PAD_LINES" 'BEGIN { srand(7); for (i = 0; i < n; i++) print "INSERT " rand() rand() rand() }'
fi
if [ "${FAKE_TRUNCATED:-0}" != "1" ]; then
  printf -- '--\n-- PostgreSQL database dump complete\n--\n\n\\unrestrict fixture\n\n'
fi
'''

FAKE_CURL = r'''#!/usr/bin/env bash
{
  echo "ARGS: $*"
  echo "STDIN: $(cat)"
} >> "$FAKE_STATE/curl.log"
response_file=""
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--output" ]; then
    shift
    response_file="$1"
  fi
  shift
done
if [ -n "$response_file" ]; then
  printf '%s' "${FAKE_CURL_BODY:-}" > "$response_file"
fi
printf '%s' "${FAKE_CURL_HTTP:-200}"
exit "${FAKE_CURL_EXIT:-0}"
'''


class BackupScriptTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory(prefix="suneng-backup-test-")
        self.tmp = Path(self._tmp.name)
        self.site = self.tmp / "site"
        self.backups = self.tmp / "backup"
        self.uploads = self.tmp / "data" / "uploads"
        self.state = self.tmp / "state"
        self.bin = self.tmp / "bin"
        for directory in (self.site, self.backups, self.uploads / "2026", self.state, self.bin):
            directory.mkdir(parents=True)
        (self.site / ".env.production").write_text("TEST_ONLY=true\n")
        for name in ("a.pdf", "b.png", "2026/c.jpg"):
            (self.uploads / name).write_bytes(name.encode() * 50)
        for name, body in (("docker", FAKE_DOCKER), ("curl", FAKE_CURL)):
            path = self.bin / name
            path.write_text(body)
            path.chmod(path.stat().st_mode | stat.S_IXUSR)
        self.webhook_file = self.tmp / "webhook"
        self.webhook_file.write_text(WEBHOOK + "\n")

    def tearDown(self):
        self._tmp.cleanup()

    def run_backup(self, *args, webhook=True, **env):
        full_env = {
            **os.environ,
            "PATH": f"{self.bin}{os.pathsep}{os.environ['PATH']}",
            "BACKUP_DIR": str(self.backups),
            "BACKUP_UPLOADS_DIR": str(self.uploads),
            "BACKUP_ALERT_WEBHOOK_FILE": str(self.webhook_file if webhook else self.tmp / "absent"),
            "BACKUP_MIN_FREE_KB": "1",
            "FAKE_STATE": str(self.state),
            "FAKE_CURL_BODY": '{"code":0}',
            **{key: str(value) for key, value in env.items()},
        }
        return subprocess.run(
            ["bash", str(SCRIPT), *args], cwd=self.site, env=full_env,
            text=True, errors="replace", capture_output=True, timeout=60,
        )

    def names(self, pattern):
        return sorted(path.name for path in self.backups.glob(pattern))

    def status(self):
        return json.loads((self.backups / "last-status.json").read_text())

    def alerts(self):
        log = self.state / "curl.log"
        return log.read_text() if log.exists() else ""

    def old_file(self, name, days, body=b"older backup"):
        path = self.backups / name
        path.write_bytes(body)
        moment = time.time() - days * DAY
        os.utime(path, (moment, moment))
        return path

    def test_good_run_publishes_a_verified_pair_and_stays_silent(self):
        result = self.run_backup()
        self.assertEqual(result.returncode, 0, result.stderr)
        databases, uploads = self.names("db-*.sql.gz"), self.names("uploads-*.tar.gz")
        self.assertEqual((len(databases), len(uploads)), (1, 1))
        self.assertEqual(self.names("*.partial"), [])
        status = self.status()
        self.assertEqual(status["status"], "ok")
        self.assertEqual(status["database"]["tables"], 28)
        self.assertEqual(status["uploads"]["files"], 3)
        self.assertEqual(status["database"]["file"], databases[0])
        self.assertIn("db 28 tables", result.stdout)
        self.assertEqual(self.alerts(), "", "a successful backup must not notify anyone")

    def test_checksum_file_matches_the_published_archives(self):
        self.assertEqual(self.run_backup().returncode, 0)
        [checksum_file] = self.names("backup-*.sha256")
        lines = (self.backups / checksum_file).read_text().split("\n")
        recorded = {line.split()[1].lstrip("*"): line.split()[0] for line in lines if line.strip()}
        self.assertEqual(len(recorded), 2)
        for name, digest in recorded.items():
            self.assertEqual(hashlib.sha256((self.backups / name).read_bytes()).hexdigest(), digest)

    def test_failed_dump_leaves_nothing_that_looks_like_a_backup(self):
        result = self.run_backup(FAKE_DUMP_EXIT=2)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.names("db-*"), [])
        self.assertEqual(self.names("uploads-*"), [])
        status = self.status()
        self.assertEqual(status["status"], "failed")
        self.assertEqual(status["stage"], "database dump")
        self.assertFalse((self.backups / "last-success").exists())
        self.assertIn("官网备份失败", self.alerts())

    def test_truncated_dump_is_rejected_even_though_it_decompresses(self):
        result = self.run_backup(FAKE_TRUNCATED=1)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.names("db-*"), [])
        self.assertEqual(self.status()["stage"], "database verification")
        self.assertIn("completion marker", self.status()["error"])

    def test_structurally_empty_dump_is_rejected(self):
        result = self.run_backup(FAKE_TABLES=3)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.names("db-*"), [])
        self.assertIn("3 tables", self.status()["error"])

    def test_failed_run_never_rotates_older_backups_away(self):
        keep_db = self.old_file("db-20260101-020001.sql.gz", days=30)
        keep_uploads = self.old_file("uploads-20260101-020001.tar.gz", days=30)
        self.assertNotEqual(self.run_backup(FAKE_TRUNCATED=1).returncode, 0)
        self.assertTrue(keep_db.exists(), "the only remaining database backup was deleted")
        self.assertTrue(keep_uploads.exists())

    def test_good_run_rotates_only_its_own_expired_files(self):
        expired = [
            self.old_file("db-20260101-020001.sql.gz", days=10),
            self.old_file("uploads-20260101-020001.tar.gz", days=10),
            self.old_file("backup-20260101-020001.sha256", days=10),
            self.old_file("db-20260102-020001.sql.gz.partial", days=3),
        ]
        kept = [
            self.old_file("db-20260915-020001.sql.gz", days=3),
            self.old_file("suneng-geo-files-20260729T142059.tar", days=50),
            self.old_file("notes.txt", days=50),
        ]
        self.assertEqual(self.run_backup().returncode, 0)
        self.assertEqual([path.name for path in expired if path.exists()], [])
        self.assertEqual([path.name for path in kept if not path.exists()], [])

    def test_shrunken_dump_is_kept_and_reported(self):
        self.old_file("db-20260917-020001.sql.gz", days=1, body=os.urandom(400_000))
        result = self.run_backup()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(self.names("db-*.sql.gz")), 2, "a valid backup must not be discarded")
        self.assertIn("shrank", self.status()["warnings"])
        self.assertIn("官网备份告警", self.alerts())

    def test_growing_dump_raises_no_warning(self):
        self.old_file("db-20260917-020001.sql.gz", days=1, body=b"x" * 200)
        result = self.run_backup(FAKE_PAD_LINES=2000)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.status()["warnings"], "")
        self.assertEqual(self.alerts(), "")

    def test_low_disk_space_stops_before_anything_is_dumped(self):
        result = self.run_backup(BACKUP_MIN_FREE_KB=10**15)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.state / "docker-called").exists())
        self.assertEqual(self.status()["stage"], "preflight")

    def test_missing_env_file_is_reported_not_silently_skipped(self):
        (self.site / ".env.production").unlink()
        result = self.run_backup()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(".env.production", self.status()["error"])

    def test_webhook_url_never_reaches_output_or_the_process_list(self):
        result = self.run_backup(FAKE_DUMP_EXIT=2)
        self.assertNotIn("SECRET-TOKEN", result.stdout + result.stderr)
        self.assertNotIn("SECRET-TOKEN", (self.backups / "last-status.json").read_text())
        args_lines = [line for line in self.alerts().splitlines() if line.startswith("ARGS:")]
        self.assertEqual(len(args_lines), 1)
        self.assertNotIn("SECRET-TOKEN", args_lines[0], "the URL must go through stdin, not argv")
        self.assertIn(WEBHOOK, self.alerts())

    def test_failure_without_a_webhook_still_fails_loudly(self):
        result = self.run_backup(webhook=False, FAKE_DUMP_EXIT=2)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Backup FAILED", result.stderr)
        self.assertEqual(self.alerts(), "")

    def test_undeliverable_alert_does_not_change_the_exit_code(self):
        failed = self.run_backup(FAKE_DUMP_EXIT=2, FAKE_CURL_EXIT=7)
        self.assertEqual(failed.returncode, 2)
        self.assertIn("could not be delivered", failed.stderr)

    def test_platform_acceptance_requires_http_and_business_success(self):
        for http, body in [
            (200, '{"code":0}'),
            (200, '{"StatusCode":0}'),
            (200, '{"code":0,"StatusCode":0}'),
        ]:
            with self.subTest(http=http, body=body):
                result = self.run_backup(FAKE_DUMP_EXIT=2, FAKE_CURL_HTTP=http, FAKE_CURL_BODY=body)
                self.assertEqual(result.returncode, 2)
                self.assertNotIn("Alert ", result.stderr)
                self.assertEqual(self.names(".alert-response.*"), [])

    def test_http_rejection_is_visible_and_preserves_backup_failure(self):
        for http in (301, 403, 429, 500):
            with self.subTest(http=http):
                result = self.run_backup(FAKE_DUMP_EXIT=2, FAKE_CURL_HTTP=http)
                self.assertEqual(result.returncode, 2)
                self.assertIn("non-success HTTP response", result.stderr)
                self.assertEqual(self.status()["status"], "failed")
                self.assertEqual(self.names(".alert-response.*"), [])

    def test_business_rejection_and_unknown_responses_are_visible(self):
        for body in [
            '{"code":19021,"msg":"SECRET-TOKEN"}',
            '{"StatusCode":1}', '{"code":false}', '{"code":"0"}',
            '{"code":1,"StatusCode":0}', '{}', '[]', 'null', '',
            '<html>SECRET-TOKEN</html>', 'x' * 65537,
        ]:
            with self.subTest(body=body[:60]):
                result = self.run_backup(FAKE_DUMP_EXIT=2, FAKE_CURL_BODY=body)
                self.assertEqual(result.returncode, 2)
                self.assertIn("acceptance could not be confirmed", result.stderr)
                self.assertNotIn("SECRET-TOKEN", result.stdout + result.stderr)
                self.assertEqual(self.names(".alert-response.*"), [])

    def test_rejected_warning_alert_does_not_invalidate_a_good_backup(self):
        for env in [
            {"FAKE_CURL_EXIT": 7}, {"FAKE_CURL_HTTP": 429},
            {"FAKE_CURL_BODY": '{"code":19021}'},
        ]:
            with self.subTest(env=env):
                for existing in self.backups.glob("db-*.sql.gz"):
                    existing.unlink()
                self.old_file("db-20260917-020001.sql.gz", days=1, body=os.urandom(400_000))
                result = self.run_backup(**env)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(self.status()["status"], "ok")
                self.assertTrue((self.backups / "last-success").exists())
                self.assertIn("Alert ", result.stderr)
                self.assertEqual(self.names(".alert-response.*"), [])

    def test_non_https_webhook_is_refused(self):
        self.webhook_file.write_text("http://alerts.invalid/hook\n")
        self.run_backup(FAKE_DUMP_EXIT=2)
        self.assertEqual(self.alerts(), "")

    def test_check_mode_reports_freshness(self):
        missing = self.run_backup("--check")
        self.assertEqual(missing.returncode, 1)
        self.assertEqual(self.run_backup().returncode, 0)
        self.assertEqual(self.run_backup("--check").returncode, 0)
        (self.backups / "last-success").write_text(f"{int(time.time()) - 30 * 3600}\n")
        stale = self.run_backup("--check")
        self.assertEqual(stale.returncode, 1)
        self.assertIn("30h ago", stale.stdout)
        (self.backups / "last-success").write_text("not-a-number\n")
        self.assertEqual(self.run_backup("--check").returncode, 1)

    def test_check_mode_never_takes_a_backup(self):
        self.run_backup("--check")
        self.assertFalse((self.state / "docker-called").exists())
        self.assertEqual(self.names("db-*"), [])


if __name__ == "__main__":
    unittest.main()
