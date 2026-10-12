#!/usr/bin/env python3
"""Read-only, exact-plan one-case collector. Never fills or submits any form."""
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import subprocess
import urllib.parse
import importlib.util
_SANITIZER_PATH = pathlib.Path(__file__).resolve().parent / 'sanitize-evidence.py'
_SANITIZER_SPEC = importlib.util.spec_from_file_location('sanitize_evidence', _SANITIZER_PATH)
_SANITIZER = importlib.util.module_from_spec(_SANITIZER_SPEC)
_SANITIZER_SPEC.loader.exec_module(_SANITIZER)

parser = argparse.ArgumentParser()
parser.add_argument('--phase', choices=['candidate', 'production'], required=True)
parser.add_argument('--plan', required=True)
parser.add_argument('--plan-sha256', required=True)
parser.add_argument('--identity-before', required=True)
parser.add_argument('--case', required=True)
parser.add_argument('--session', required=True)
parser.add_argument('--attempt', type=int, choices=[1, 2], default=1)
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parent
plan_bytes = pathlib.Path(args.plan).read_bytes()
assert hashlib.sha256(plan_bytes).hexdigest() == args.plan_sha256
plan = json.loads(plan_bytes)
contract = json.loads((root / 'browserContract.json').read_text())
specs = json.loads((root / 'browser-assertion-spec.json').read_text())
assert plan['browserContract'] == contract
if args.phase == 'candidate':
    preview_bytes = (root / 'candidate-preview-contract.json').read_bytes()
    preview = json.loads(preview_bytes)
    assert preview['sourceCommit'] == plan['sourceCommit'] and preview['originalPlanSha256'] == args.plan_sha256
    assert preview['originalContractSha256'] == hashlib.sha256((root / 'browserContract.json').read_bytes()).hexdigest()
    contract = preview['previewContract']
assert re.fullmatch(r'[a-f0-9]{40}', plan['sourceCommit'])
assert re.fullmatch(r'[A-Za-z0-9_-]{1,80}', plan['qaMarker'])
identity = json.loads(pathlib.Path(args.identity_before).read_text())
assert identity['readOnly'] is True
container = identity['container']
assert container['source'] == plan['sourceCommit']
assert container['image'] == plan['runtimeImage']
assert container['running'] is True and container['health'] == 'healthy'
base = identity['baseUrl']
origin = urllib.parse.urlparse(base)
if args.phase == 'candidate':
    assert origin.hostname == '127.0.0.1' and origin.scheme == 'http'
    tunnel = identity['tunnel']
    assert tunnel['server'] == 'suneng-ecs-prod'
    assert tunnel['sourceCommit'] == plan['sourceCommit'] and tunnel['sshSessionId']
    assert origin.port == tunnel['localPort']
    bindings = container['ports']['3000/tcp']
    assert len(bindings) == 1 and bindings[0]['HostIp'] == '127.0.0.1'
    assert str(tunnel['remotePort']) == bindings[0]['HostPort']
else:
    assert base == 'https://www.jssngyl.cn'
    assert container['name'] == '/corp-site-frontend'
expected = contract[args.case]
details = specs[args.case]
view = 'mobile' if expected['viewport']['width'] == 390 else 'pc'
assert args.session == 'release-' + args.phase + '-base-' + view + '-' + plan['sourceCommit'][:12]
case_dir = root / args.phase / plan['sourceCommit'][:12] / args.case
if args.attempt == 2:
    first = json.loads((case_dir / 'attempt-1' / 'collector-receipt.json').read_text())
    assert first['passed'] is False
out = case_dir / ('attempt-' + str(args.attempt))
out.mkdir(parents=True, exist_ok=False)
commands = []

def run(command, file, stdin=None, required=True):
    command = ['agent-browser', '--json', '--session', args.session] + command
    result = subprocess.run(command, input=stdin, text=True, capture_output=True, timeout=45)
    (out / file).write_text(_SANITIZER.safe_output(result.stdout, result.stderr))
    commands.append({'command':command, 'exitCode':result.returncode, 'file':file})
    if required and result.returncode:
        raise RuntimeError(file + ' exit ' + str(result.returncode))
    parsed = _SANITIZER.sanitize(json.loads(result.stdout))
    if required and parsed.get('success') is not True:
        raise RuntimeError(file + ' did not report success')
    return parsed

def actual_eval(text, file):
    value = run(['eval', '--stdin'], file, stdin=text)['data']['result']
    return json.loads(value) if isinstance(value, str) else value

failure = None
data = None
try:
    v = expected['viewport']
    run(['set', 'viewport', str(v['width']), str(v['height'])], 'viewport.raw.json')
    run(['console', '--clear'], 'console-clear.raw.json')
    run(['errors', '--clear'], 'errors-clear.raw.json')
    run(['network', 'requests', '--clear'], 'network-clear.raw.json')
    path = expected['path']
    marker = urllib.parse.urlencode({'acquisition_qa':plan['qaMarker']})
    if details['assertionDetails']['kind'] == 'home' and args.phase == 'production':
        run(['open', base + path + '?' + marker], 'qa-init-open.raw.json')
        condition = "!!sessionStorage.getItem('suneng_session_id') && sessionStorage.getItem('suneng_session_id') === sessionStorage.getItem('suneng_manual_qa_session_v1')"
        run(['wait', '--fn', condition], 'qa-init-ready.raw.json')
        actual_eval("({url:location.href,sessionId:sessionStorage.getItem('suneng_session_id'),qaSession:sessionStorage.getItem('suneng_manual_qa_session_v1'),at:new Date().toISOString()})", 'qa-init-observed.raw.json')
        url = base + path
    elif details['assertionDetails']['kind'] == 'home':
        url = base + path
    else:
        url = base + path + '?' + marker
    run(['open', url], 'open.raw.json')
    ready = 'location.pathname===' + json.dumps(path)
    ready += " && !!document.querySelector('main h1,h1') && document.querySelector('main h1,h1').innerText.trim().length>0 && !!document.querySelector('main') && document.querySelector('main').innerText.trim().length>200"
    assertion_details = details['assertionDetails']
    if assertion_details['kind'] == 'article':
        ready += ' && document.querySelector("[data-news-slug]")?.getAttribute("data-news-slug")===' + json.dumps(path.rsplit('/',1)[1])
        title = assertion_details['expected']['title']
    else:
        title = assertion_details.get('heading')
    normalized_h1 = "document.querySelector('main h1,h1').innerText.replace(/\\s+/g,' ').trim()"
    if title:
        ready += ' && ' + normalized_h1 + '===' + json.dumps(title,ensure_ascii=False)
    elif assertion_details.get('headingContains'):
        ready += ' && ' + normalized_h1 + '.includes(' + json.dumps(assertion_details['headingContains']) + ')'
    if args.phase == 'production':
        ready += " && !!sessionStorage.getItem('suneng_session_id') && sessionStorage.getItem('suneng_session_id') === sessionStorage.getItem('suneng_manual_qa_session_v1')"
    run(['wait', '--fn', ready], 'ready.raw.json')
    run(['snapshot', '-i', '-u'], 'snapshot.raw.json')
    run(['screenshot', str(out / 'page.png')], 'screenshot.raw.json')
    observe = 'const EXPECTATION=' + json.dumps(details, ensure_ascii=False) + ';\n'
    observe += 'const CONTRACT=' + json.dumps(expected, ensure_ascii=False) + ';\n'
    observe += (root / 'observe-base.js').read_text()
    data = actual_eval(observe, 'dom-measurements.raw.json')
    data.update({'sourceCommit':plan['sourceCommit'], 'runtimeImage':plan['runtimeImage'],
                 'planSha256':args.plan_sha256, 'case':args.case,
                 **({'candidatePreviewContractSha256':hashlib.sha256(preview_bytes).hexdigest()} if args.phase=='candidate' else {}),
                 'identityBeforeInput':str(pathlib.Path(args.identity_before).resolve())})
    (out / 'record.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    run(['screenshot', str(out / 'observed.png')], 'observed-screenshot.raw.json')
    run(['network', 'requests', '--status', '400-599'], 'failed-requests.raw.json')
except Exception as error:
    failure = _SANITIZER.redact_text(str(error))
finally:
    console_ok = errors_ok = False
    try:
        messages = run(['console'], 'console.raw.json')['data']['messages']
        lines = []
        for message in messages:
            kind = message.get('type', message.get('level', 'unknown'))
            text = message.get('text', message.get('message', json.dumps(message, ensure_ascii=False)))
            lines.append('[' + str(kind) + '] ' + str(text))
        console_text = '\n'.join(lines)
        (out / 'console.log').write_text(console_text)
        console_ok = re.search(r'hydrat|did not match|\[(error|warn(ing)?)\]', console_text, re.I) is None
        errors = run(['errors'], 'errors.raw.json')['data']['errors']
        (out / 'errors.log').write_text('\n'.join(json.dumps(x, ensure_ascii=False) for x in errors))
        errors_ok = len(errors) == 0
    except Exception as error:
        failure = failure or _SANITIZER.redact_text(str(error))
    passed = failure is None and data is not None and data['rendered'] is True \
        and data['overflow'] is False and all(data['assertions'].values()) \
        and data['viewport'] == expected['viewport'] and (data['qaSessionMatches'] is True if args.phase == 'production' else data['localPreviewTrackingSuppressed'] is True) and console_ok and errors_ok
    receipt = {'atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
               'phase':args.phase, 'case':args.case, 'attempt':args.attempt,
               'session':args.session, 'sourceCommit':plan['sourceCommit'],
               'planSha256':args.plan_sha256, 'passed':passed, 'collectorFailure':failure,
               'commands':commands, 'contactClicked':False, 'formSubmitted':False,
               'boundFilesSha256':{f.name:hashlib.sha256(f.read_bytes()).hexdigest()
                                   for f in out.iterdir() if f.is_file()},
               'limits':['Real DOM measurement must be accompanied by screenshot inspection.',
                         'Final report still requires fresh after identity and full byte binding.']}
    (out / 'collector-receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
if not passed:
    raise SystemExit('Real capture failed: ' + str(out))
