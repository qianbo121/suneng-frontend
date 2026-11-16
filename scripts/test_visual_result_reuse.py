import importlib.util
import io
import json
import os
from contextlib import redirect_stdout
from tempfile import TemporaryDirectory
from unittest.mock import patch
import subprocess
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("reuse", Path(__file__).with_name("visual-result-reuse.py"))
reuse = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reuse)

REPO = "sample/site"
BASE, HEAD, PR_HEAD, MERGE, TREE = [c * 40 for c in "abcde"]
ENV = ("ubuntu-26.04", "20261111.196.1", "1:20240730+repack1-1build1")


class EvidenceTest(unittest.TestCase):
    def setUp(self):
        self.pr = {"merged_at": "2026-11-16T10:30:00Z", "merge_commit_sha": HEAD, "number": 9,
                   "base": {"repo": {"full_name": REPO}, "ref": "main"},
                   "head": {"repo": {"full_name": REPO}, "ref": "fix/page", "sha": PR_HEAD}}
        self.run = {"id": 5, "head_sha": PR_HEAD, "head_branch": "fix/page", "head_repository": {"full_name": REPO},
                    "repository": {"full_name": REPO}, "event": "pull_request", "path": reuse.WORKFLOW,
                    "status": "completed", "conclusion": "success", "run_attempt": 1,
                    "updated_at": "2026-11-16T10:26:00Z", "html_url": "https://github.com/sample/site/actions/runs/5"}
        self.commit = {"sha": MERGE, "parents": [{"sha": BASE}, {"sha": PR_HEAD}], "tree": {"sha": TREE}}
        names = ("Set up job", "Run actions/checkout@v7", "Install deterministic CJK font", "Visual regression")
        self.steps = [{"name": name, "status": "completed", "conclusion": "success",
                       "started_at": f"2026-11-16T10:0{i}:00Z", "completed_at": f"2026-11-16T10:0{i}:10Z"}
                      for i, name in enumerate(names)]
        self.job = {"id": 7, "run_id": 5, "name": "Website visual regression", "conclusion": "success",
                    "steps": self.steps}
        data = [(0, "##[group]Runner Image"), (0, "Image: "+ENV[0]), (0, "Version: "+ENV[1]),
                (1, "[command]/usr/bin/git checkout --progress --force refs/remotes/pull/9/merge"),
                (1, "[command]/usr/bin/git log -1 --format=%H"), (1, MERGE),
                (2, f"Setting up fonts-noto-cjk ({ENV[2]}) ...")]
        self.log = "\n".join(f"2026-11-16T10:0{i}:03.0100000Z {line}" for i, line in data)
        self.prs = [self.pr]
        self.runs = [self.run]
        self.jobs = {"jobs": [self.job], "total_count": 1}
        self.changed = set()
        self.parents = BASE
        self.checkout = HEAD

    def api(self, path, logs=False):
        path = path.removeprefix("repos/"+REPO)
        responses = {"/commits/"+HEAD+"/pulls?per_page=100": self.prs,
                     "/actions/workflows/ci.yml/runs?event=pull_request&branch=fix%2Fpage&per_page=1":
                         {"workflow_runs": self.runs},
                     "/actions/runs/5/attempts/1/jobs?per_page=100": self.jobs,
                     "/git/commits/"+MERGE: self.commit,
                     "/actions/jobs/7/logs": self.log}
        self.assertEqual(logs, path.endswith("/logs"))
        return responses[path]

    def git(self, *args):
        if args[1] == "diff":
            return "\n".join(self.changed.intersection(args[args.index("--")+1:]))
        if args[1] == "show":
            return self.parents
        return self.checkout if args[-1] == "HEAD" else TREE

    def verify(self, env=ENV):
        return reuse.verify(REPO, BASE, HEAD, env, api=self.api, git=self.git)

    def test_verified_first_attempt_including_baseline_and_test_edits(self):
        self.changed.update({"frontend/tests/visual/smoke-pages.spec.ts", "frontend/tests/visual/__screenshots__/home.png"})
        self.assertIn("PR #9", self.verify())
        self.job["name"] = "Frontend (lint + test + build)"
        self.assertIn("PR #9", self.verify())

    def test_separate_job_takes_precedence_over_legacy_copy(self):
        self.jobs["jobs"].append({**self.job, "name": "Frontend (lint + test + build)"})
        self.jobs["total_count"] = 2
        self.job["conclusion"] = "failure"
        with self.assertRaises(reuse.Unverified):
            self.verify()

    def test_direct_push_or_different_checkout(self):
        self.prs.clear()
        with self.assertRaises(reuse.Unverified): self.verify()
        self.prs.append(self.pr)
        self.checkout = BASE
        with self.assertRaises(reuse.Unverified): self.verify()

    def test_no_fork_no_different_workflow_no_rerun_no_late_success(self):
        cases = [("head_repository", {"full_name": "another/site"}), ("repository", {"full_name": "another/site"}),
                 ("head_sha", HEAD), ("head_branch", "other"), ("path", ".github/workflows/other.yml"),
                 ("event", "pull_request_target"), ("run_attempt", 2), ("conclusion", "failure"),
                 ("status", "in_progress"), ("updated_at", "2026-11-16T10:32:00Z")]
        for key, value in cases:
            with self.subTest(key=key), self.assertRaises(reuse.Unverified):
                original = self.run[key]
                try:
                    self.run[key] = value
                    self.verify()
                finally:
                    self.run[key] = original
        self.pr["head"]["repo"]["full_name"] = "another/site"
        with self.assertRaises(reuse.Unverified): self.verify()

    def test_skipped_missing_or_ambiguous_visual_step(self):
        for conclusion in ["skipped", "failure", "cancelled", None]:
            self.steps[-1]["conclusion"] = conclusion
            with self.subTest(conclusion=conclusion), self.assertRaises(reuse.Unverified): self.verify()
        self.steps[-1]["conclusion"] = "success"
        self.steps.append(self.steps[-1].copy())
        with self.assertRaises(reuse.Unverified): self.verify()
        del self.steps[-2:]
        with self.assertRaises(reuse.Unverified): self.verify()

    def test_missing_latest_run_and_incomplete_jobs(self):
        self.jobs["total_count"] = 2
        with self.assertRaises(reuse.Unverified): self.verify()
        self.runs.clear()
        with self.assertRaises(reuse.Unverified): self.verify()

    def test_new_base_head_or_baseline_after_pr_run(self):
        for record, key, value in [(self.commit["tree"], "sha", HEAD), (self.commit["parents"][0], "sha", TREE),
                                   (self.commit["parents"][1], "sha", HEAD)]:
            original = record[key]
            record[key] = value
            with self.subTest(value=value), self.assertRaises(reuse.Unverified): self.verify()
            record[key] = original
        self.parents = TREE
        with self.assertRaises(reuse.Unverified): self.verify()

    def test_every_controlling_path_forces_full(self):
        for path in reuse.CONTROL_FILES:
            self.changed = {path}
            with self.subTest(path=path), self.assertRaises(reuse.Unverified): self.verify()

    def test_runner_image_and_font_must_match_exactly(self):
        for env in [(ENV[0], "20261111.82.6", ENV[2]), (*ENV[:2], "new"), ("ubuntu-24.04", *ENV[1:])]:
            with self.subTest(env=env), self.assertRaises(reuse.Unverified): self.verify(env)
        self.log = self.log.replace("Setting up fonts-noto-cjk", "Missing font record")
        with self.assertRaises(reuse.Unverified): self.verify()

    def test_checkout_identity_and_environment_are_step_scoped(self):
        original = self.log
        for log in [original.replace("pull/9/merge", "pull/90/merge"), original.replace("10:01:03", "10:04:03"),
                    original.replace("10:02:03", "10:03:03"), original + "\n" + original, ""]:
            self.log = log
            with self.assertRaises(reuse.Unverified): self.verify()

    def test_decision_output_defaults_to_full_on_api_errors_or_wrong_event(self):
        with TemporaryDirectory() as temp:
            root = Path(temp)
            event = {"before": BASE, "after": HEAD, "ref": "refs/heads/main", "created": False,
                     "forced": False, "deleted": False}
            (root/"event.json").write_text(json.dumps(event))
            env = {"GITHUB_EVENT_NAME": "push", "GITHUB_EVENT_PATH": str(root/"event.json"),
                   "GITHUB_SHA": HEAD, "GITHUB_REPOSITORY": REPO, "GITHUB_OUTPUT": str(root/"out"),
                   "GITHUB_STEP_SUMMARY": str(root/"summary")}
            for event_name, response, expected in [
                    ("push", "verified source", "true"),
                    ("push", KeyError("missing source data"), "false"),
                    ("push", subprocess.CalledProcessError(1, ["gh"]), "false"),
                    ("push", subprocess.TimeoutExpired("gh", 20), "false"),
                    ("push", reuse.Unverified("Different trees"), "false"),
                    ("pull_request", "verified source", "false")]:
                with self.subTest(event_name=event_name, response=response):
                    env["GITHUB_EVENT_NAME"] = event_name
                    with patch.dict(os.environ, env), patch.object(reuse, "current_environment", return_value=ENV), \
                         patch.object(reuse, "verify") as verifier, redirect_stdout(io.StringIO()):
                        if isinstance(response, Exception):
                            verifier.side_effect = response
                        else:
                            verifier.return_value = response
                        reuse.main()
                    self.assertEqual((root/"out").read_text().splitlines()[-1], "reused="+expected)

    def test_actual_summary_gate(self):
        workflow = Path(__file__).resolve().parents[1]/".github/workflows/ci.yml"
        code = workflow.read_text().split('          case "$JOB_RESULT:$REQUIRED:$OUTCOME:$REUSED" in', 1)[1]
        script = 'case "$JOB_RESULT:$REQUIRED:$OUTCOME:$REUSED" in' + code.split("esac", 1)[0] + "esac"
        good = {("true", "success", ""), ("true", "success", "false"),
                ("true", "skipped", "true"), ("false", "skipped", "")}
        for required in ("true", "false", ""):
            for outcome in ("skipped", "success", "failure", ""):
                for reused in ("true", "false", ""):
                    for status in ("success", "failure", "cancelled"):
                        env = dict(JOB_RESULT=status, REQUIRED=required, OUTCOME=outcome, REUSED=reused)
                        result = subprocess.run(["bash", "-c", script], env=env, capture_output=True)
                        self.assertEqual(result.returncode == 0, status == "success" and
                                         (required,outcome,reused) in good, env)


if __name__ == "__main__":
    unittest.main()
