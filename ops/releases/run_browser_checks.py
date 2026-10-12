"""Bound first-load/menu checks with a workload budget; never submits an inquiry."""
import json
import os
from pathlib import Path
import subprocess
from urllib.parse import urlsplit

import browser_capture_guard as guard
import release_candidate
import release_contract as contract


TEST_FILES = ('tests/visual/page-first-load-stability.spec.ts',
              'tests/visual/inquiry-direction-visibility.spec.ts')


def validate_result(value):
    contract.required(value, ('stats', 'suites', 'errors'))
    contract.need(not value['errors'] and value['stats'].get('expected') == 12 and
                  all(value['stats'].get(k) == 0 for k in ('unexpected', 'flaky', 'skipped')),
                  'all-twelve-focused-checks-required')
    tests = []
    def visit(suite):
        for spec in suite.get('specs', []): tests.extend(spec.get('tests', []))
        for child in suite.get('suites', []): visit(child)
    for suite in value['suites']: visit(suite)
    contract.need(len(tests) == 12 and all(test.get('expectedStatus') == 'passed' and
                  test.get('status') == 'expected' and len(test.get('results', [])) == 1 and
                  test['results'][0].get('status') == 'passed' for test in tests),
                  'skipped-retried-or-incomplete-focused-checks')
    return {'passed': True, 'focusedCasesPassed': 12, 'freshContextsRequired': 24,
            'realArticleRoutesRequired': 3, 'browserAcceptanceComplete': False}


def run(root, config, identity, plan, output, budget):
    root, output = Path(root), Path(output)
    contract.need(config.get('sourceCommit') == plan['sourceCommit'], 'capture-config-source-mismatch')
    workspace = Path(config['sourceWorktree']).absolute()
    before = subprocess.check_output(['git', '-C', str(workspace), 'rev-parse', 'HEAD'], text=True).strip()
    contract.need(before == plan['sourceCommit'] and not subprocess.check_output(
        ['git', '-C', str(workspace), 'status', '--porcelain']), 'clean-exact-source-required')
    observed = identity['container']
    contract.need(identity.get('readOnly') is True and observed.get('source') == plan['sourceCommit'] and
                  observed.get('image') == plan['runtimeImage'] and observed.get('running') is True and
                  observed.get('health') == 'healthy', 'capture-runtime-identity-required')
    phase = config['_capturePhase']
    url = urlsplit(identity['baseUrl'])
    contract.need((phase == 'candidate' and url.scheme == 'http' and url.hostname == '127.0.0.1') or
                  (phase == 'production' and url.scheme == 'https' and url.hostname == 'www.jssngyl.cn'),
                  'capture-origin-required')
    sources = {name: guard.digest(workspace/'frontend'/name) for name in TEST_FILES}
    args = ['pnpm', '--dir', 'frontend', 'exec', 'playwright', 'test',
            '--config=playwright.visual.config.ts', *TEST_FILES, '--workers=1', '--retries=0',
            '--timeout='+str(budget), '--reporter=json', '--output='+str(output/'artifacts')]
    env = dict(os.environ, VISUAL_BASE_URL=identity['baseUrl'], PLAYWRIGHT_BROWSER_CHANNEL='chrome')
    with (output/'stdout.json').open('xb') as stdout, (output/'stderr.log').open('xb') as stderr:
        result = subprocess.run(args, cwd=workspace, env=env, stdout=stdout, stderr=stderr,
                                timeout=(budget*12//1000)+120)
    contract.need(subprocess.check_output(['git', '-C', str(workspace), 'rev-parse', 'HEAD'], text=True).strip()
                  == before and not subprocess.check_output(['git', '-C', str(workspace), 'status', '--porcelain'])
                  and sources == {name: guard.digest(workspace/'frontend'/name) for name in TEST_FILES},
                  'capture-source-changed')
    contract.need(result.returncode == 0, 'focused-browser-checks-failed')
    summary = validate_result(guard.load(output/'stdout.json'))
    summary.update(sourceCommit=plan['sourceCommit'], runtimeImage=plan['runtimeImage'], phase=phase,
                   perTestBudgetMs=budget, sourceFilesSha256=sources,
                   stdoutSha256=guard.digest(output/'stdout.json'), stderrSha256=guard.digest(output/'stderr.log'),
                   leadSubmitRequested=False, productionChanged=False, releaseAccepted=False)
    release_candidate.create(output/'focused-result.json', summary)
    return summary
