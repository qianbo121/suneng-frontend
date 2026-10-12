#!/usr/bin/env python3
"""Prepare maintained browser collectors and caller-bound per-release check data."""
import argparse
import json
from pathlib import Path
import browser_capture_guard as guard
import release_browser

COLLECTORS = ('capture-contract-case.py', 'assemble-browser-report.py', 'observe-base.js',
              'sanitize-evidence.py', 'capture-interactions.py', 'assemble-interactions-report.py')
DATA = ('browserContract.json', 'browser-assertion-spec.json', 'acceptance-plan.json',
        'browser-identity-and-evidence-contract.json')


def prepare(root, plan_sha, inputs, inputs_sha):
    root = Path(root).absolute()
    guard.require(root.is_dir() and not any(p.is_symlink() for p in (root, *root.parents)),
                  'safe-existing-root-required')
    plan = release_browser.checked(root/'plan.json', plan_sha)
    guard.require(guard.SOURCE.fullmatch(plan.get('sourceCommit', '')) and
                  guard.IMAGE.fullmatch(plan.get('runtimeImage', '')), 'frozen-source-and-runtime-required')
    references = release_browser.checked(Path(inputs), inputs_sha)
    guard.require(set(references) == set(DATA), 'exact-four-capture-data-files-required')
    content = {}
    for name, reference in references.items():
        guard.require(set(reference) == {'path', 'sha256'}, 'bound-data-reference-required')
        raw = guard.read(Path(reference['path']))
        guard.require(guard.sha(raw) == reference['sha256'], 'capture-data-digest-mismatch')
        content[name] = raw
    contract = json.loads(content['browserContract.json'])
    guard.require(contract == plan.get('browserContract') and len(contract) == 20 and
                  release_browser.HOMES <= set(contract) and
                  guard.sha(content['browserContract.json']) == plan.get('browserContractSha256'),
                  'unchanged-twenty-view-contract-required')
    guard.require(set(json.loads(content['browser-assertion-spec.json'])) == set(contract),
                  'complete-assertion-spec-required')
    source = Path(__file__).with_name('browser')
    for name in COLLECTORS:
        content[name] = guard.read(source/name)
    destination = root/'browser'
    guard.require(not destination.is_symlink(), 'symlink-destination-refused')
    if destination.exists():
        guard.require(destination.is_dir(), 'directory-required')
        # Validate every existing target before writing any new file.
        for name, raw in content.items():
            target = destination/name
            if target.exists() or target.is_symlink():
                guard.require(guard.read(target) == raw, 'existing-capture-input-differs')
    else:
        destination.mkdir(mode=0o700)
    for name, raw in content.items():
        target = destination/name
        if not target.exists():
            with target.open('xb') as stream:
                stream.write(raw)
            target.chmod(0o600)
    return {'prepared': True, 'sourceCommit': plan['sourceCommit'],
            'filesSha256': {name: guard.digest(destination/name) for name in content},
            'browserAccepted': False, 'productionChanged': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--plan-sha256', required=True)
    parser.add_argument('--inputs', type=Path, required=True)
    parser.add_argument('--inputs-sha256', required=True)
    args = parser.parse_args()
    print(json.dumps(prepare(args.root, args.plan_sha256, args.inputs, args.inputs_sha256)))


if __name__ == '__main__':
    main()
