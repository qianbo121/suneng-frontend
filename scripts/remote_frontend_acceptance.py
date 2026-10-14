#!/usr/bin/env python3
"""Reproduce a frozen, read-only focused release check on an ephemeral runner.

Only JSON receipts are imported. The source checkout and maintained test command
are not changed. No SSH credentials, application archives or deploy command are
accepted. Returned phase receipts must still be reconciled with live identity.
"""
import argparse
import base64
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

FIXED = {'entry-config.json', 'release-config.json', 'plan.json', 'manifest.json',
         'artifacts/frontend/candidate.json', 'preparation-baseline.json',
         'browser/production-identity-before.json', 'entry/release.json',
         'entry/apply/operation/operation.json'}
ATTEMPT = re.compile(r'entry/apply/operation/attempt-[0-9TZ-]+[a-f0-9]+/(?:started|finished)\.json')
BASE = Path('/Users/qianbo')
ROOT_PARENT = BASE / 'Desktop/Coding/独立站/output/verified-release-archives'
WORK_PARENT = BASE / '.codex/worktrees'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def decode(encoded, expected):
    if not re.fullmatch(r'[0-9a-f]{64}', expected):
        raise ValueError('invalid payload digest')
    compressed = base64.b64decode(encoded, validate=True)
    if len(compressed) > 60000 or sha(compressed) != expected:
        raise ValueError('payload digest or size mismatch')
    # Limit expansion before parsing; no archive extraction or arbitrary paths.
    import io
    with gzip.GzipFile(fileobj=io.BytesIO(compressed)) as stream:
        raw = stream.read(1_000_001)
    if len(raw) > 1_000_000:
        raise ValueError('payload too large')
    payload = json.loads(raw)
    if set(payload) != {'schemaVersion', 'files'} or payload['schemaVersion'] != 1:
        raise ValueError('invalid envelope')
    files = payload['files']
    if not isinstance(files, dict) or not FIXED <= files.keys() or len(files) > 30:
        raise ValueError('missing or excessive receipts')
    result = {}
    for name, record in files.items():
        if name not in FIXED and not ATTEMPT.fullmatch(name):
            raise ValueError('unapproved receipt path')
        if set(record) != {'base64', 'sha256'}:
            raise ValueError('invalid receipt descriptor')
        data = base64.b64decode(record['base64'], validate=True)
        if sha(data) != record['sha256']:
            raise ValueError('receipt digest mismatch')
        json.loads(data)
        result[name] = data
    config = json.loads(result['entry-config.json'])
    release = json.loads(result['release-config.json'])
    root, work = Path(config['root']), Path(release['sourceWorktree'])
    if (root.parent != ROOT_PARENT or not re.fullmatch(r'frontend-[a-z0-9-]+', root.name)
            or work.parent.parent != WORK_PARENT or work.name != '独立站'
            or not re.fullmatch(r'[a-z0-9-]+', work.parent.name)):
        raise ValueError('unapproved replay location')
    source = release['sourceCommit']
    if not re.fullmatch(r'[0-9a-f]{40}', source) or source != config['sourceCommit']:
        raise ValueError('source mismatch')
    identity = json.loads(result['browser/production-identity-before.json'])
    if identity.get('baseUrl') != 'https://www.jssngyl.cn':
        raise ValueError('only the public production origin is allowed')
    return result, config, release


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=['prepare', 'run'])
    args = parser.parse_args()
    files, config, release = decode(os.environ['QA_RECEIPTS'], os.environ['QA_RECEIPTS_SHA256'])
    root, workspace = Path(config['root']), Path(release['sourceWorktree'])
    source = release['sourceCommit']
    if args.phase == 'prepare':
        if root.exists() or workspace.exists():
            raise ValueError('ephemeral destinations must not exist')
        for name, data in files.items():
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open('xb') as stream:
                stream.write(data)
        workspace.parent.mkdir(parents=True, exist_ok=True)
        with open(os.environ['GITHUB_ENV'], 'a') as env:
            env.write(f'QA_ROOT={root}\nQA_WORKSPACE={workspace}\nQA_SOURCE={source}\n')
        return
    if subprocess.check_output(['git', '-C', str(workspace), 'rev-parse', 'HEAD'], text=True).strip() != source:
        raise ValueError('source checkout differs')
    sys.path.insert(0, str(workspace / 'ops/releases'))
    from release_entry import Entry
    import phase_runtime
    entry = Entry(root / 'entry-config.json', sha(files['entry-config.json']))
    entry.checked('focused-production')
    entry.prerequisite('apply')
    stage = entry.stage_directory('focused-production')
    if stage.exists():
        raise ValueError('remote check must have a new attempt')
    export = Path(os.environ['RUNNER_TEMP']) / 'focused-evidence'
    export.mkdir()
    details = {'sourceCommit': source, 'workflowSha': os.environ['GITHUB_SHA'],
               'runId': os.environ['GITHUB_RUN_ID'], 'runAttempt': os.environ['GITHUB_RUN_ATTEMPT'],
               'runnerOs': os.environ['RUNNER_OS'], 'inputBundleSha256': os.environ['QA_RECEIPTS_SHA256'],
               'sourceFilesSha256': {str(p.relative_to(workspace)): sha(p.read_bytes()) for p in [
                   workspace / 'ops/releases/release_entry.py', workspace / 'ops/releases/run_browser_checks.py',
                   workspace / 'frontend/playwright.visual.config.ts',
                   workspace / 'frontend/tests/visual/page-first-load-stability.spec.ts',
                   workspace / 'frontend/tests/visual/inquiry-direction-visibility.spec.ts']},
               'transport': 'runner default network to public HTTPS hostname',
               'productionChanged': False, 'inquirySubmitted': False}
    try:
        result = entry.run('focused-production')
        details['result'] = result
    finally:
        details['phaseStatus'] = phase_runtime.status(stage)
        (export / 'runner-provenance.json').write_text(json.dumps(details, ensure_ascii=False, indent=2))
        if stage.exists():
            shutil.copytree(stage, export / 'entry/focused-production' / stage.name)


if __name__ == '__main__':
    main()
