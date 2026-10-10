#!/usr/bin/env python3
"""Review bound browser captures and package evidence, without executing captures or deployment."""
import argparse
import copy
import gzip
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import tarfile
from urllib.parse import urlsplit

import browser_capture_guard as guard

HOMES = {'home-zh-pc', 'home-en-pc', 'home-zh-mobile', 'home-en-mobile'}
MAX_BYTES = 128 * 1024 * 1024
MAX_FILES = 3000
DEFAULT_INTERACTIONS = {
    f'{view}/{task}': {'viewport': [1440, 900] if view == 'pc' else [390, 844],
                     'states': {'news-search': 3, 'equipment-links': 10 if view == 'pc' else 2,
                                'trolley-resources': 6 if view == 'pc' else 2, 'contacts': 4}[task],
                     'arrivals': {'news-search': 1, 'equipment-links': 5 if view == 'pc' else 1,
                                  'trolley-resources': 3 if view == 'pc' else 1, 'contacts': 0}[task]}
    for view in ('pc', 'mobile')
    for task in ('news-search', 'equipment-links', 'trolley-resources', 'contacts')
}


def checked(path, expected):
    guard.require(isinstance(expected, str) and guard.SHA.fullmatch(expected), 'external-sha256-required')
    raw = guard.read(path)
    guard.require(guard.sha(raw) == expected, 'reviewed-evidence-digest-mismatch')
    return json.loads(raw)


def load_plan(root, expected):
    root = Path(root).absolute()
    plan = checked(root/'plan.json', expected)
    guard.require(guard.SOURCE.fullmatch(plan.get('sourceCommit', '')) and
                  guard.IMAGE.fullmatch(plan.get('runtimeImage', '')), 'source-runtime-plan-required')
    contract = checked(root/'browser/browserContract.json', plan.get('browserContractSha256'))
    guard.require(contract == plan.get('browserContract') and isinstance(contract, dict) and contract,
                  'unchanged-approved-browser-contract-required')
    return root, plan


def preview_contract(original):
    guard.require(isinstance(original, dict) and len(original) == 20 and HOMES <= set(original),
                  'approved-twenty-view-home-contract-required')
    result = copy.deepcopy(original)
    for key in HOMES:
        row = result[key]
        guard.require(row['path'] == ('/zh' if key.startswith('home-zh-') else '/en') and
                      row.get('query') == {} and row['assertions'].count('qaSessionMatches') == 1 and
                      'localPreviewTrackingSuppressed' not in row['assertions'],
                      'exact-plain-home-qa-assertion-required')
        row['assertions'] = ['localPreviewTrackingSuppressed' if value == 'qaSessionMatches' else value
                             for value in row['assertions']]
    return result


def validate(root, report_name, phase, *, plan_sha256, report_sha256, preview_sha256=None):
    guard.require(phase in ('candidate', 'production'), 'candidate-or-production-required')
    root, plan = load_plan(root, plan_sha256)
    report = checked(root/guard.relative(report_name), report_sha256)
    adapted = copy.deepcopy(plan)
    if preview_sha256 is not None:
        guard.require(phase == 'candidate', 'preview-exception-never-applies-to-production')
        declaration = checked(root/'browser/candidate-preview-contract.json', preview_sha256)
        guard.require(declaration.get('sourceCommit') == plan['sourceCommit'] and
                      declaration.get('originalPlanSha256') == plan_sha256 and
                      declaration.get('originalContractSha256') == plan['browserContractSha256'],
                      'same-source-original-preview-contract-required')
        derived = preview_contract(plan['browserContract'])
        guard.require(declaration.get('previewContract') == derived and
                      report.get('candidatePreviewContractSha256') == preview_sha256,
                      'only-four-home-preview-assertions-may-differ')
        diagnostics = declaration.get('diagnosticFilesSha256')
        guard.check_bound_files(root, diagnostics)
        records = [row for row in report.get('records', []) if row.get('case') in HOMES]
        guard.require(len(records) == 4 and {row['case'] for row in records} == HOMES,
                      'four-actual-home-captures-required')
        for row in records:
            observed = guard.load(root/guard.relative(row['recordFile']))
            qa = observed.get('observations', {}).get('qa', {})
            guard.require(urlsplit(observed.get('url', '')).hostname == '127.0.0.1' and
                          observed.get('localPreviewTrackingSuppressed') is True and
                          qa.get('hostname') == '127.0.0.1' and qa.get('localPreviewTrackingSuppressed') is True and
                          qa.get('sessionId', 'missing') is None and qa.get('qaSession', 'missing') is None and
                          qa.get('keys') == ['suneng_session_id', 'suneng_manual_qa_session_v1'],
                          'actual-loopback-suppression-with-null-identities-required')
        adapted['browserContract'] = derived
    guard.browser(root, report_name, phase, adapted, plan_sha256)
    guard.require(guard.sha(guard.read(root/'plan.json')) == plan_sha256 and
                  guard.sha(guard.read(root/guard.relative(report_name))) == report_sha256,
                  'browser-input-changed-during-validation')
    return report


def validate_interactions(root, name, *, plan_sha256, report_sha256):
    """Keep the accepted eight-task observations, counts, raw logs and source bindings."""
    root, plan = load_plan(root, plan_sha256)
    report = checked(root/guard.relative(name), report_sha256)
    guard.require(report.get('passed') is True and report.get('phase') == 'production' and
                  report.get('method') == 'real-browser' and report.get('sourceCommit') == plan['sourceCommit'] and
                  report.get('runtimeImage') == plan['runtimeImage'] and report.get('planSha256') == plan_sha256 and
                  report.get('externalContactActivated') is False and report.get('formSubmitted') is False and
                  report.get('contactDialogOpened') is True and report.get('identityChecks') and
                  all(value is True for value in report['identityChecks'].values()),
                  'bound-production-interactions-without-external-contact-required')
    guard.check_bound_files(root, report.get('boundFilesSha256'))
    for key in ('identityBefore', 'identityAfter'):
        guard.require(report[key] in report['boundFilesSha256'], 'interaction-identity-not-bound')
    before, after = [guard.load(root/guard.relative(report[key])) for key in ('identityBefore', 'identityAfter')]
    guard.require(before['container'] == after['container'] and before['baseUrl'] == after['baseUrl'] == 'https://www.jssngyl.cn' and
                  before.get('readOnly') is True and after.get('readOnly') is True, 'same-actual-interaction-identity-required')
    container = before['container']
    guard.require(container.get('name') == '/corp-site-frontend' and container.get('source') == plan['sourceCommit'] and
                  container.get('image') == plan['runtimeImage'] and container.get('health') == 'healthy' and
                  container.get('running') is True and guard.SHA.fullmatch(container.get('id', '')),
                  'actual-healthy-production-container-required')
    for identity in (before, after):
        raw_name = identity['rawIdentityFile']
        guard.require(raw_name in report['boundFilesSha256'] and
                      guard.load(root/guard.relative(raw_name)) == container, 'actual-raw-container-binding-required')
    start, end = guard.instant(before['checkedAtUtc']), guard.instant(after['checkedAtUtc'])
    guard.require(start <= end, 'ordered-interaction-window-required')
    contract = plan.get('interactionContract', DEFAULT_INTERACTIONS)
    rows = report.get('reports')
    guard.require(isinstance(rows, list) and len(rows) == len(contract) == report.get('actualTaskCount') and
                  {f"{row['viewport']}/{row['task']}" for row in rows} == set(contract), 'complete-interaction-matrix-required')
    states = arrivals = 0
    for row in rows:
        spec = contract[f"{row['viewport']}/{row['task']}"]
        guard.require(row.get('passed') is True and row.get('checks') and all(v is True for v in row['checks'].values()) and
                      row['receipt'] in report['boundFilesSha256'], 'passed-bound-interaction-required')
        path = root/guard.relative(row['receipt']);receipt = guard.load(path)
        guard.require(receipt.get('passed') is True and receipt.get('method') == 'real-browser' and
                      receipt.get('phase') == 'production' and receipt.get('sourceCommit') == plan['sourceCommit'] and
                      receipt.get('runtimeImage') == plan['runtimeImage'] and receipt.get('planSha256') == plan_sha256 and
                      receipt.get('task') == row['task'] and receipt.get('viewport') == spec['viewport'] and
                      receipt.get('formSubmitted') is False and receipt.get('leadFormSubmitted') is False and
                      receipt.get('externalContactActivated') is False and start <= guard.instant(receipt['atUtc']) <= end,
                      'actual-task-receipt-source-and-window-required')
        contact_task = row['task'] == 'contacts'
        guard.require(receipt.get('contactClicked') is contact_task and
                      receipt.get('contactDialogOpened') is contact_task,
                      'contact-dialog-must-match-task')
        collector = 'browser/capture-interactions.py'
        guard.require(collector in report['boundFilesSha256'] and
                      receipt['collectorSourceSha256'] == guard.digest(root/collector), 'interaction-collector-must-be-bound')
        expected = receipt['boundFilesSha256']
        guard.require(expected and all(PurePosixPath(n).name == n and guard.SHA.fullmatch(s) and
                                      guard.digest(path.parent/n) == s for n, s in expected.items()),
                      'unchanged-task-evidence-required')
        guard.require(all(n in expected for n in ('console.raw.json', 'errors.raw.json')),
                      'raw-task-logs-must-be-bound')
        messages = checked(path.parent/'console.raw.json', expected['console.raw.json'])['data']['messages']
        errors = checked(path.parent/'errors.raw.json', expected['errors.raw.json'])['data']['errors']
        console = '\n'.join('['+str(m.get('type', m.get('level', 'unknown')))+'] '+
                            str(m.get('text', m.get('message', json.dumps(m)))) for m in messages)
        guard.require(receipt['consoleMessageCount'] == len(messages) and
                      re.search(r'hydrat|did not match|\[(error|warn(ing)?)\]', console, re.I) is None and
                      receipt['runtimeErrorCount'] == len(errors) == 0, 'actual-clean-task-console-required')
        guard.require(len(receipt['states']) == spec['states'] == row['actualStateCount'] and
                      len(receipt['actualNavigationArrivals']) == spec['arrivals'] == row['actualNavigationCount'],
                      'actual-state-and-arrival-counts-required')
        for state in receipt['states']:
            for field in ('record', 'screenshot'):
                guard.require(PurePosixPath(state[field]).name == state[field] and state[field] in expected,
                              'safe-bound-task-state-required')
            observed = guard.load(path.parent/state['record']);qa = observed['observed'].get('qaAssociation', {})
            url = urlsplit(observed['url']);viewport = spec['viewport']
            guard.require(observed.get('assertions') and all(v is True for v in observed['assertions'].values()) and
                          observed['assertions'].get('qaSessionMatches') is True and
                          qa.get('hostname') == 'www.jssngyl.cn' and isinstance(qa.get('sessionId'), str) and
                          qa['sessionId'] and qa.get('qa') == qa['sessionId'] and
                          (url.scheme, url.hostname, url.port) == ('https', 'www.jssngyl.cn', None) and
                          observed['observed']['viewport'] == {'width': viewport[0], 'height': viewport[1]} and
                          start <= guard.instant(observed['at']) <= end, 'actual-task-observations-required')
            png = guard.read(path.parent/state['screenshot'])
            guard.require(len(png) > 1024 and png[:8] == b'\x89PNG\r\n\x1a\n' and
                          guard.struct.unpack('>II', png[16:24])[0] == viewport[0] and
                          guard.struct.unpack('>II', png[16:24])[1] >= viewport[1], 'real-task-png-required')
        states += spec['states'];arrivals += spec['arrivals']
    guard.require(states == report['actualStateCount'] and arrivals == report['actualNavigationCount'],
                  'actual-total-interaction-counts-required')
    guard.require(guard.digest(root/'plan.json') == plan_sha256 and guard.digest(root/guard.relative(name)) == report_sha256,
                  'interaction-input-changed-during-validation')
    return report


def pack(root, reports, output):
    """Package all retained browser evidence; an empty log must be genuinely report-bound."""
    root = Path(root).absolute();output = Path(output).absolute()
    guard.require(not output.exists() and not output.is_symlink() and output.parent.is_dir() and
                  not any(p.is_symlink() for p in output.parents) and
                  '..' not in output.parts and not output.is_relative_to(root/'browser'),
                  'new-private-bundle-output-required')
    bound = {}
    for report in reports:
        for name, digest in report['boundFilesSha256'].items():
            guard.require(name not in bound or bound[name] == digest, 'conflicting-evidence-bindings')
            bound[name] = digest
    items = [];total = 0
    for directory, dirs, files in os.walk(root/'browser', followlinks=False):
        guard.require(not any((Path(directory)/name).is_symlink() for name in dirs), 'no-evidence-directory-links')
        for name in sorted(files):
            path = Path(directory)/name;rel = path.relative_to(root).as_posix();raw = guard.read(path)
            guard.require(raw or (path.name in ('console.log', 'errors.log') and bound.get(rel) == guard.sha(b'')),
                          'empty-unproduced-evidence-rejected')
            total += len(raw)
            guard.require(len(items) < MAX_FILES and total <= MAX_BYTES, 'evidence-package-size-or-file-count-limit')
            items.append((rel, raw))
    guard.require(items and len(items) <= MAX_FILES and sum(len(raw) for _, raw in items) <= MAX_BYTES,
                  'evidence-package-size-or-file-count-limit')
    with output.open('xb') as target:
        os.fchmod(target.fileno(), 0o600)
        with gzip.GzipFile(fileobj=target, mode='wb', mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode='w|', format=tarfile.USTAR_FORMAT) as tar:
                for rel, raw in sorted(items):
                    entry = tarfile.TarInfo(rel);entry.size = len(raw);entry.mode = 0o600
                    tar.addfile(entry, io.BytesIO(raw))
    for rel, raw in items:guard.require(guard.digest(root/rel) == guard.sha(raw), 'evidence-changed-during-pack')
    bundle_bytes = output.stat().st_size
    guard.require(0 < bundle_bytes <= MAX_BYTES, 'compressed-evidence-package-size-limit')
    return {'passed': True, 'fileCount': len(items), 'uncompressedBytes': sum(len(raw) for _, raw in items),
            'bundleSha256': guard.digest(output), 'bundleBytes': bundle_bytes,
            'failedEvidencePreserved': True, 'productionChanged': False}
