#!/usr/bin/env python3
"""Verify a same-repository PR page check before reusing it on the main push."""
import json
import os
import re
import subprocess
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urlencode

WORKFLOW = ".github/workflows/ci.yml"
CONTROL_FILES = (WORKFLOW, "scripts/visual-check-scope.py", "frontend/playwright.visual.config.ts",
                 "frontend/scripts/run-visual-regression.sh", "scripts/visual-result-reuse.py")


class Unverified(Exception):
    """A reason suitable for the Actions summary, independent of log contents."""


def require(condition, reason):
    if not condition:
        raise Unverified(reason)


def only(items, reason):
    items = list(items)
    require(len(items) == 1, reason)
    return items[0]


def command(*args):
    return subprocess.run(args, capture_output=True, check=True, timeout=20).stdout.decode("utf-8-sig")


def github(path, *, logs=False):
    data = command("gh", "api", "--hostname", "github.com", path)
    return data if logs else json.loads(data)


def sha(value):
    require(isinstance(value, str) and re.fullmatch(r"[0-9a-f]{40}", value) and value != "0"*40,
            "Missing or invalid commit identity")
    return value


def success_step(job, name):
    step = only((s for s in job["steps"] if s["name"] == name), "Missing or ambiguous step: " + name)
    require(step["status"] == "completed" and step["conclusion"] == "success", "Unsuccessful step: " + name)
    return step


def step_lines(lines, step):
    # Scope native job log records to the timestamps returned by the Jobs API.
    start, end = step["started_at"][:19], step["completed_at"][:19]
    return [line.partition("Z ")[2] for line in lines if start <= line[:19] <= end and "Z " in line]


def runner_environment(setup, install):
    image, version = only(re.finditer(r"(?m)^##\[group\]Runner Image\nImage: (ubuntu-[\d.]+)\nVersion: ([\d.]+)$",
                                      "\n".join(setup)), "Runner image version not verified").groups()
    match = only(re.finditer(r"(?m)^(?:Setting up fonts-noto-cjk \(([^()\s]+)\) \.\.\.|"
                             r"fonts-noto-cjk is already the newest version \(([^()\s]+)\)\.)$",
                             "\n".join(install)), "Installed CJK font version not verified")
    return image, version, match.group(1) or match.group(2)


def tested_commit(checkout, pr_number):
    require(f"[command]/usr/bin/git checkout --progress --force refs/remotes/pull/{pr_number}/merge" in checkout,
            "Checkout was not the matching PR merge ref")
    commit = only(re.finditer(r"(?m)^\[command\]/usr/bin/git log -1 --format=%H\n([0-9a-f]{40})$",
                              "\n".join(checkout)), "Actual checkout commit not verified")
    return commit.group(1)


def current_environment():
    os_release = dict(line.split("=", 1) for line in Path("/etc/os-release").read_text().splitlines()
                      if "=" in line)
    image = os_release["ID"].strip('"') + "-" + os_release["VERSION_ID"].strip('"')
    status, version = command("dpkg-query", "-W", "-f=${db:Status-Status} ${Version}", "fonts-noto-cjk").split()
    require(status == "installed", "Current CJK font not installed")
    return image, os.environ["ImageVersion"], version


def step_seconds(step):
    return int((datetime.fromisoformat(step["completed_at"].replace("Z", "+00:00"))
                - datetime.fromisoformat(step["started_at"].replace("Z", "+00:00"))).total_seconds())


def verify(repo, before, head, environment, api=github, git=command):
    sha(before)
    sha(head)
    require(git("git", "rev-parse", "HEAD").strip() == head, "Main checkout mismatch")
    parents = git("git", "show", "-s", "--format=%P", head).split()
    require(parents and parents[0] == before, "Push is not one merge from the previous main")
    changed = git("git", "diff", "--no-ext-diff", "--no-renames", "--name-only", before, head, "--", *CONTROL_FILES)
    require(not changed, "Page check control files changed")
    base = f"repos/{repo}"
    prs = api(f"{base}/commits/{head}/pulls?per_page=100")
    require(len(prs) < 100, "Incomplete merge history")
    pr = only((p for p in prs if p["merged_at"] and p["merge_commit_sha"] == head
               and p["base"]["repo"]["full_name"] == repo and p["base"]["ref"] == "main"),
              "Push is not an identified merged PR")
    require(pr["head"]["repo"]["full_name"] == repo, "External PR source")
    head_sha = sha(pr["head"]["sha"])
    query = urlencode({"event": "pull_request", "branch": pr["head"]["ref"], "per_page": 1})
    runs = api(f"{base}/actions/workflows/ci.yml/runs?{query}")["workflow_runs"]
    run = only(runs, "No latest PR workflow run")
    require(run["head_sha"] == head_sha and run["head_branch"] == pr["head"]["ref"]
            and run["head_repository"]["full_name"] == repo and run["repository"]["full_name"] == repo
            and run["event"] == "pull_request" and run["path"] == WORKFLOW,
            "Latest run does not match this repository, PR head and workflow")
    require(run["status"] == "completed" and run["conclusion"] == "success" and run["run_attempt"] == 1
            and run["updated_at"] <= pr["merged_at"], "Latest run was not a first-attempt success before merge")

    jobs = api(f"{base}/actions/runs/{run['id']}/attempts/1/jobs?per_page=100")
    require(len(jobs["jobs"]) == jobs["total_count"], "Incomplete job list")
    visual = [j for j in jobs["jobs"] if j["name"] == "Website visual regression"]
    # Before the split, the very same named step ran in Frontend (e.g. batch 254).
    job = only(visual or [j for j in jobs["jobs"] if j["name"] == "Frontend (lint + test + build)"],
               "Missing or ambiguous page job")
    require(job["conclusion"] == "success" and job["run_id"] == run["id"], "Page job was not successful")
    step = success_step(job, "Visual regression")
    setup = success_step(job, "Set up job")
    checkout = success_step(job, "Run actions/checkout@v7")
    font = success_step(job, "Install deterministic CJK font")
    lines = api(f"{base}/actions/jobs/{job['id']}/logs", logs=True).splitlines()
    tested = tested_commit(step_lines(lines, checkout), pr["number"])
    commit = api(f"{base}/git/commits/{tested}")
    tree = sha(git("git", "rev-parse", head + "^{tree}").strip())
    require(commit["sha"] == tested and [p["sha"] for p in commit["parents"]] == [before, head_sha]
            and commit["tree"]["sha"] == tree, "Tested merge parents or content differ")
    require(runner_environment(step_lines(lines, setup), step_lines(lines, font)) == environment,
            "Runner image or installed CJK font differs")
    return f"PR #{pr['number']}, [first successful page run]({run['html_url']}), tree `{tree}`, " \
           f"prior screenshot step {step_seconds(step)}s (reference duration)"


def main():
    started = time.monotonic()
    reused = False
    try:
        event = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_bytes())
        require(os.environ["GITHUB_EVENT_NAME"] == "push" and event["ref"] == "refs/heads/main"
                and not event["forced"] and not event["deleted"] and not event["created"]
                and event["after"] == os.environ["GITHUB_SHA"], "Not a normal push to main")
        reason = verify(os.environ["GITHUB_REPOSITORY"], event["before"], event["after"], current_environment())
        reused = True
    except Unverified as error:
        reason = str(error)
    except (KeyError, TypeError, ValueError, OSError, subprocess.SubprocessError) as error:
        reason = f"Evidence unavailable ({type(error).__name__})"
    result = f"Page check reuse: {'verified' if reused else 'full run'} — {reason}. Lookup {time.monotonic()-started:.1f}s."
    print(result)
    with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
        print(result, file=summary)
    with open(os.environ["GITHUB_OUTPUT"], "a") as output:
        print(f"reused={str(reused).lower()}", file=output)


if __name__ == "__main__":
    main()
