#!/usr/bin/env python3
"""Bind actual captures and before/after identities; derive acceptance from observations."""
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import struct
import urllib.parse

parser = argparse.ArgumentParser()
parser.add_argument('--artifact-root', required=True)
parser.add_argument('--plan', required=True)
parser.add_argument('--plan-sha256', required=True)
parser.add_argument('--phase', choices=['candidate', 'production'], required=True)
parser.add_argument('--identity-before', required=True)
parser.add_argument('--identity-after', required=True)
parser.add_argument('--report-name')
args = parser.parse_args()
out = pathlib.Path(__file__).resolve().parent
artifact_root = pathlib.Path(args.artifact_root).resolve()
plan_bytes = pathlib.Path(args.plan).read_bytes()
assert hashlib.sha256(plan_bytes).hexdigest() == args.plan_sha256
plan = json.loads(plan_bytes)
contract = json.loads((out / 'browserContract.json').read_text())
assert plan['browserContract'] == contract
preview_bytes = None
if args.phase == 'candidate':
    preview_bytes = (out / 'candidate-preview-contract.json').read_bytes()
    preview = json.loads(preview_bytes)
    assert preview['sourceCommit'] == plan['sourceCommit'] and preview['originalPlanSha256'] == args.plan_sha256
    assert preview['originalContractSha256'] == hashlib.sha256((out / 'browserContract.json').read_bytes()).hexdigest()
    contract = preview['previewContract']

def relative(file):
    return str(pathlib.Path(file).resolve().relative_to(artifact_root))

def instant(text):
    value = datetime.datetime.fromisoformat(text.replace('Z', '+00:00'))
    assert value.tzinfo is not None
    return value

before_path = pathlib.Path(args.identity_before).resolve()
after_path = pathlib.Path(args.identity_after).resolve()
before = json.loads(before_path.read_text())
after = json.loads(after_path.read_text())
start, end = instant(before['checkedAtUtc']), instant(after['checkedAtUtc'])
checks = {
    'identityWindowOrdered': start <= end,
    'sameActualContainer': before['container'] == after['container'],
    'sameActualOrigin': before['baseUrl'] == after['baseUrl'],
    'sameActualSource': before['container']['source'] == plan['sourceCommit'],
    'sameActualImage': before['container']['image'] == plan['runtimeImage'],
    'actualRunningHealthy': before['container']['running'] is True
        and before['container']['health'] == 'healthy',
    'readOnlyIdentity': before['readOnly'] is True and after['readOnly'] is True,
}
bound = {}

def bind(file):
    file = pathlib.Path(file).resolve()
    bound[relative(file)] = hashlib.sha256(file.read_bytes()).hexdigest()

for identity_path, identity in [(before_path, before), (after_path, after)]:
    bind(identity_path)
    raw_path = artifact_root / identity['rawIdentityFile']
    assert json.loads(raw_path.read_text()) == identity['container']
    bind(raw_path)
collector_names = ['capture-contract-case.py', 'observe-base.js', 'assemble-browser-report.py', 'sanitize-evidence.py']
for name in collector_names + ['browserContract.json', 'browser-assertion-spec.json',
                               'browser-identity-and-evidence-contract.json']:
    bind(out / name)
if args.phase == 'candidate':
    bind(out / 'candidate-preview-contract.json')
    for file, expected_hash in preview['diagnosticFilesSha256'].items():
        path=artifact_root / file
        assert hashlib.sha256(path.read_bytes()).hexdigest()==expected_hash
        bind(path)
records, observations, failed_attempts = [], [], []
origin = urllib.parse.urlsplit(before['baseUrl'])
phase_root = out / args.phase / plan['sourceCommit'][:12]
for case, expected in contract.items():
    case_root = phase_root / case
    attempts = sorted(case_root.glob('attempt-*'))
    assert attempts and len(attempts) <= 2
    selected = attempts[-1]
    for attempt in attempts:
        receipt = json.loads((attempt / 'collector-receipt.json').read_text())
        assert receipt['case'] == case and receipt['phase'] == args.phase
        assert receipt['sourceCommit'] == plan['sourceCommit']
        assert receipt['planSha256'] == args.plan_sha256
        for file in attempt.iterdir():
            if file.is_file():
                bind(file)
        if receipt['passed'] is False:
            failed_attempts.append({'case':case,'attempt':receipt['attempt'],
                                    'receipt':relative(attempt/'collector-receipt.json')})
    receipt = json.loads((selected / 'collector-receipt.json').read_text())
    data = json.loads((selected / 'record.json').read_text())
    url = urllib.parse.urlsplit(data['url'])
    query = {k:v for k,v in urllib.parse.parse_qs(url.query).items() if k != 'acquisition_qa'}
    png = (selected / 'page.png').read_bytes()
    width, height = struct.unpack('>II', png[16:24])
    console = (selected / 'console.log').read_text()
    errors = (selected / 'errors.log').read_text()
    actual_checks = {
        'collectorPassed': receipt['passed'] is True,
        'actualAssertionsComplete': data['assertions'] == {key:True for key in expected['assertions']},
        'actualViewportMatches': data['viewport'] == expected['viewport'],
        'renderedWithoutOverflow': data['rendered'] is True and data['overflow'] is False,
        'actualRouteAndQueryMatch': url.path == expected['path'] and query == expected.get('query',{}),
        'actualOriginMatchesIdentity': (url.scheme,url.hostname,url.port)
            == (origin.scheme,origin.hostname,origin.port),
        'captureInsideIdentityWindow': start <= instant(data['at']) <= end,
        'actualPngMatchesViewport': png[:8] == b'\x89PNG\r\n\x1a\n' and len(png)>1024
            and width == expected['viewport']['width'] and height >= expected['viewport']['height'],
        'runtimeErrorsEmpty': not errors.strip(),
        'consoleNoWarningsOrHydrationErrors': re.search(r'hydrat|did not match|\[(error|warn(ing)?)\]',console,re.I) is None,
        'noContactsOrFormSubmission': receipt['contactClicked'] is False and receipt['formSubmitted'] is False,
    }
    if args.phase == 'production':
        actual_checks['actualQaAttribution'] = data.get('qaSessionMatches') is True
    else:
        actual_checks['actualLocalPreviewSuppression']=data.get('localPreviewTrackingSuppressed') is True
        actual_checks['actualPreviewContractBound']=data.get('candidatePreviewContractSha256')==hashlib.sha256(preview_bytes).hexdigest()
    observations.append({'case':case,'checks':actual_checks,'passed':all(actual_checks.values())})
    records.append({'case':case,'recordFile':relative(selected/'record.json'),
                    'screenshot':relative(selected/'page.png'),
                    'consoleFile':relative(selected/'console.log'),
                    'errorsFile':relative(selected/'errors.log')})
passed = all(checks.values()) and len(records) == len(contract) and all(x['passed'] for x in observations)
report = {'passed':passed,'phase':args.phase,'sourceCommit':before['container']['source'],
          'method':'real-browser','contactClicked':False,'formSubmitted':False,
          'boundFilesSha256':bound,'collectorFiles':[relative(out/n) for n in collector_names],
          'planSha256':args.plan_sha256,'identityBefore':relative(before_path),
          'identityAfter':relative(after_path),'records':records,
          'actualCaseCount':len(records),'derivedIdentityChecks':checks,
          'derivedCaptureChecks':observations,'retainedFailedAttempts':failed_attempts,
          'generatedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'limits':['This report binds the distinct read-only base-view sessions; extra interaction sessions are separate.',
                    'Screenshots and raw collector/identity evidence must be inspected by the release reviewer.']}
if args.phase == 'candidate':
    report['acceptedContainerId'] = before['container']['id']
    report['candidatePreviewContractSha256']=hashlib.sha256(preview_bytes).hexdigest()
name = args.report_name or args.phase + '-browser-report-' + plan['sourceCommit'][:12] + '.json'
assert pathlib.Path(name).name == name
with (out / name).open('x') as handle:
    json.dump(report,handle,ensure_ascii=False,indent=2)
    handle.write('\n')
print(json.dumps({'report':str(out/name),'passed':passed,'cases':len(records),
                  'retainedFailedAttempts':len(failed_attempts)},ensure_ascii=False))
if not passed:
    raise SystemExit(1)
