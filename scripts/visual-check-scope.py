#!/usr/bin/env python3
"""Skip screenshots only for an explicitly reviewed, non-rendering change set.

Every CI job still runs its ordinary lint, type, unit and build checks. Unknown
paths, unavailable commit trees and incomplete baselines always require visuals.
Compare trees rather than a PR's file list: the checkout is the code being tested.
"""

import argparse
from dataclasses import asdict, dataclass
import json
from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]

# Exact files reviewed for this rule. Do not replace this with a .ts glob or a
# directory rule: utilities can affect rendered content, and tests can exercise UI.
# .tsx collectors remain outside the allowlist even if they currently return null.
NON_RENDERING_PATHS = frozenset({
    'frontend/src/lib/analytics/traffic-source.ts',
    'frontend/src/lib/analytics/traffic-source.spec.ts',
    'frontend/src/lib/analytics/local-preview.ts',
    'frontend/src/lib/analytics/local-preview.spec.ts',
    'frontend/src/lib/analytics/baidu.ts',
    'frontend/src/lib/analytics/baidu.spec.ts',
    'frontend/src/lib/api/lead-events.ts',
    'frontend/src/lib/api/lead-events.spec.ts',
    'frontend/src/lib/api/lead-events-storage.spec.ts',
    'frontend/src/lib/api/lead-events-tracking.spec.ts',
    'frontend/src/lib/api/lead-events-recovery.spec.ts',
    'backend/src/modules/shuju-service/shuju-traffic-filter.ts',
    'backend/src/modules/shuju-service/shuju-traffic-filter.integration.spec.ts',
    'backend/src/modules/shuju-service/shuju-growth-read.service.ts',
    'backend/src/modules/shuju-service/shuju-growth-read.service.spec.ts',
    'backend/src/modules/shuju-service/shuju-growth-read-order.spec.ts',
})

BASELINE_PREFIX = 'frontend/tests/visual/__screenshots__/smoke-pages.spec.ts/linux-chrome/'
REQUIRED_BASELINES = frozenset(
    BASELINE_PREFIX + name
    for page in ('home', 'products', 'trolley-furnace', 'about', 'contact')
    for name in (
        f'{page}-desktop-1440.png',
        f'{page}-laptop-1280.png',
        f'{page}-mobile-390.png',
    )
)


@dataclass(frozen=True)
class Scope:
    required: bool
    reason: str
    changed_paths: int = 0


def git(repository, *args):
    return subprocess.run(
        ['git', '-C', str(repository), *args],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30,
    ).stdout


def verified_commit(repository, value):
    # Never accept a branch, option, revision expression, empty/zero SHA or blob.
    if not re.fullmatch(r'[0-9a-fA-F]{40}', value or '') or set(value) == {'0'}:
        return None
    value = value.lower()
    resolved = git(repository, 'rev-parse', '--verify', value + '^{commit}').decode().strip()
    return value if resolved == value else None


def tree_files(repository, commit, *paths):
    entries = {}
    for record in git(repository, 'ls-tree', '-r', '-z', '--full-tree', commit, '--', *paths).split(b'\0'):
        if not record:
            continue
        metadata, path = record.split(b'\t', 1)
        mode, kind, _object = metadata.decode('ascii').split()
        entries[path.decode('utf-8')] = (mode, kind)
    return entries


def diff_changes(repository, base, head):
    # NUL separation preserves whitespace/newlines in real filenames. Rename
    # entries include both the old and new paths; neither may bypass the rule.
    tokens = git(repository, 'diff', '--name-status', '-z', '--find-renames',
                 base, head, '--').split(b'\0')
    if tokens[-1] != b'':
        raise ValueError('Incomplete diff record')
    tokens.pop()
    changes = []
    index = 0
    while index < len(tokens):
        status = tokens[index].decode('ascii')
        index += 1
        count = 2 if re.fullmatch(r'[RC]\d+', status) else 1
        if not re.fullmatch(r'[ADMTRCUXB](?:\d+)?', status) or index + count > len(tokens):
            raise ValueError('Unsupported diff record')
        paths = tuple(token.decode('utf-8') for token in tokens[index:index + count])
        if not all(paths):
            raise ValueError('Empty diff path')
        changes.append((status, paths))
        index += count
    return changes


def classify(repository, base, head, event):
    if event not in ('pull_request', 'push'):
        return Scope(True, 'Full visual checks: unsupported event.')
    try:
        base = verified_commit(repository, base)
        head = verified_commit(repository, head)
        if not base or not head:
            return Scope(True, 'Full visual checks: comparison commits are unavailable or invalid.')
        actual_head = git(repository, 'rev-parse', '--verify', 'HEAD^{commit}').decode().strip()
        if head != actual_head:
            return Scope(True, 'Full visual checks: expected commit differs from the actual checkout.')

        for commit in (base, head):
            baselines = tree_files(repository, commit, BASELINE_PREFIX)
            if any(baselines.get(path) != ('100644', 'blob') for path in REQUIRED_BASELINES):
                return Scope(True, 'Full visual checks: a required Linux screenshot baseline is missing.')

        changes = diff_changes(repository, base, head)
        changed = {path for _status, paths in changes for path in paths}
        if not changes:
            return Scope(True, 'Full visual checks: empty comparison cannot justify skipping.', 0)
        if any(path not in NON_RENDERING_PATHS for path in changed):
            return Scope(True, 'Full visual checks: change includes UI, configuration or an unreviewed path.', len(changed))
        if any(status[0] not in ('A', 'M', 'D', 'R') for status, _paths in changes):
            return Scope(True, 'Full visual checks: change includes a file type or unsupported status.', len(changed))
        # Even an allowlisted name cannot become a symlink/submodule. Deleted
        # files need no head entry; newly added files need no base entry.
        for commit in (base, head):
            entries = tree_files(repository, commit, *sorted(changed))
            if any(mode not in ('100644', '100755') or kind != 'blob'
                   for mode, kind in entries.values()):
                return Scope(True, 'Full visual checks: reviewed file is no longer a regular source file.', len(changed))
        return Scope(False, 'Screenshots skipped: only reviewed analytics/collection logic and its tests changed; lint, types, unit tests and builds still run.', len(changed))
    except (subprocess.SubprocessError, OSError, ValueError, UnicodeError):
        return Scope(True, 'Full visual checks: unable to verify the complete comparison safely.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', type=Path, default=ROOT)
    parser.add_argument('--base', default='')
    parser.add_argument('--head', default='')
    parser.add_argument('--event', default='')
    parser.add_argument('--github-output', type=Path)
    parser.add_argument('--summary', type=Path)
    args = parser.parse_args()
    result = classify(args.repository, args.base, args.head, args.event)
    print(json.dumps(asdict(result), ensure_ascii=False))
    if args.github_output:
        with args.github_output.open('a') as output:
            output.write(f'required={str(result.required).lower()}\n')
            output.write(f'reason={result.reason}\n')
    if args.summary:
        with args.summary.open('a') as summary:
            summary.write(f'### Visual regression scope\n\n{result.reason}\n\n')
            summary.write(f'Compared changed paths: {result.changed_paths}.\n')


if __name__ == '__main__':
    main()
