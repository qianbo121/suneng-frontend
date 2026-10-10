"""Offline and remote helpers: immutable bytes, four digests, bound real-browser evidence.

No network, database, customer content, cleanup or deployment commands live here.
"""
import datetime
import hashlib
import json
import re
import stat
import struct
from pathlib import Path, PurePosixPath
from urllib.parse import parse_qs, urlsplit

SHA = re.compile(r'[0-9a-f]{64}')
SOURCE = re.compile(r'[0-9a-f]{40}')
IMAGE = re.compile(r'sha256:[0-9a-f]{64}')


def require(condition, reason):
    if not condition:
        raise RuntimeError(reason)


def regular(path):
    path = Path(path).absolute()
    require('..' not in path.parts, 'unsafe-input-path')
    for parent in (path, *path.parents):
        require(not parent.is_symlink(), 'symlink-not-allowed')
    status = path.stat()
    require(stat.S_ISREG(status.st_mode) and status.st_nlink == 1, 'regular-single-link-required')
    return path


def stamp(status):
    return (status.st_dev, status.st_ino, status.st_size, status.st_mtime_ns,
            status.st_ctime_ns, status.st_nlink)


def read(path):
    path = regular(path)
    before = stamp(path.stat())
    require(path.stat().st_size <= 32 * 1024 * 1024, 'bounded-capture-file-required')
    value = path.read_bytes()
    require(stamp(path.stat()) == before, 'file-changed-during-read')
    return value


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def digest(path):
    path = regular(path)
    before = stamp(path.stat())
    result = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    require(stamp(path.stat()) == before, 'file-changed-during-digest')
    return result.hexdigest()


def load(path):
    return json.loads(read(path))


def relative(name):
    require(isinstance(name, str) and name and '\\' not in name, 'safe-relative-file-required')
    value = PurePosixPath(name)
    require(not value.is_absolute() and '..' not in value.parts
            and value.parts and name == value.as_posix(), 'safe-relative-file-required')
    return value


def bind(root, args):
    """All four caller-reviewed digests are mandatory; do not derive them remotely."""
    hashes = {name: getattr(args, name.replace('-', '_')) for name in
              ('plan-sha256', 'manifest-sha256', 'baseline-sha256', 'driver-sha256')}
    mapping = {'plan-sha256': 'plan.json', 'manifest-sha256': 'manifest.json',
               'baseline-sha256': 'baseline.json', 'driver-sha256': 'root-driver.py'}
    for option, file in mapping.items():
        require(SHA.fullmatch(hashes[option]) is not None and digest(root / file) == hashes[option],
                'external-four-digest-binding-failed')
    return {name.replace('-', '_'): value for name, value in hashes.items()}


def add_binding_args(parser):
    for name in ('plan', 'manifest', 'baseline', 'driver'):
        parser.add_argument('--' + name + '-sha256', required=True)


def instant(value):
    result = datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
    require(result.tzinfo is not None, 'timestamp-with-timezone-required')
    return result.astimezone(datetime.timezone.utc)


def check_bound_files(root, files):
    require(isinstance(files, dict) and files, 'bound-evidence-files-required')
    for name, expected in files.items():
        require(SHA.fullmatch(expected) is not None and digest(root / relative(name)) == expected,
                'evidence-bytes-changed')


def browser(root, report_name, phase, plan, expected_plan_sha=None):
    """Validate capture bytes and identity, rather than trusting a passed flag alone.

    Captures must be produced by an actual browser collector. Report timestamps,
    screenshots, console, observed assertions and raw before/after Docker identity
    are checked. This does not claim that an arbitrary local attestation is authentic;
    the reviewer must inspect the named capture/collector evidence before release.
    """
    root = Path(root)
    report = load(root / relative(report_name))
    expected_source=plan['sourceCommit']
    if phase=='local' and plan.get('localSourceEquivalence'):
        edge=plan['localSourceEquivalence']
        require(edge.get('officialMainSourceCommit')==plan['sourceCommit']
                and edge.get('gitObjectsReverified') is True
                and digest(root/relative(edge['file']))==edge['sha256'],
                'verified-local-tree-equivalence-required')
        expected_source=edge['originalBrowserSourceCommit']
    if phase!='local':
        require(report.get('sourceCommit')==plan['sourceCommit'],
                'actual-official-image-source-required-no-tree-substitution')
    require(report.get('passed') is True and report.get('phase') == phase
            and report.get('sourceCommit') == expected_source
            and report.get('method') == 'real-browser', 'same-source-real-browser-required')
    require(report.get('contactClicked') is False and report.get('formSubmitted') is False,
            'acceptance-must-not-create-inquiries')
    check_bound_files(root, report.get('boundFilesSha256'))
    require(isinstance(report.get('collectorFiles'), list) and report['collectorFiles']
            and all(name in report['boundFilesSha256'] for name in report['collectorFiles']),
            'browser-collector-source-binding-required')
    if expected_plan_sha is not None:
        require(report.get('planSha256') == expected_plan_sha, 'same-plan-browser-required')
    before = load(root / relative(report['identityBefore']))
    after = load(root / relative(report['identityAfter']))
    require(report['identityBefore'] in report['boundFilesSha256']
            and report['identityAfter'] in report['boundFilesSha256'],
            'before-after-identity-bytes-not-bound')
    require(before['container'] == after['container'] and before['baseUrl'] == after['baseUrl'],
            'actual-image-changed-during-browser')
    start, end = instant(before['checkedAtUtc']), instant(after['checkedAtUtc'])
    require(start <= end, 'browser-identity-window-reversed')
    if phase == 'local':
        require(before['container'].get('source') == expected_source,
                'local-browser-must-use-reviewed-source')
    if phase != 'local':
        require(before.get('readOnly') is True and after.get('readOnly') is True,
                'read-only-actual-identity-required')
        container = before['container']
        require(container.get('source') == plan['sourceCommit']
                and container.get('image') == plan['runtimeImage']
                and container.get('running') is True and container.get('health') == 'healthy'
                and SHA.fullmatch(container.get('id', '')) is not None, 'actual-browser-image-required')
        for item in (before, after):
            name = item['rawIdentityFile']
            require(name in report['boundFilesSha256'] and load(root / relative(name)) == item['container'],
                    'raw-docker-identity-binding-required')
        if phase == 'candidate':
            require(report.get('acceptedContainerId') == container['id'],
                    'accepted-candidate-container-binding-required')
            require(container.get('name') == '/' + plan['uiContainerName']
                    and container.get('label') == plan['uiContainerLabel'], 'owned-ui-candidate-required')
            bindings = container.get('ports', {}).get('3000/tcp')
            require(isinstance(bindings, list) and len(bindings) == 1
                    and bindings[0].get('HostIp') == '127.0.0.1'
                    and bindings[0].get('HostPort', '').isdigit(), 'loopback-candidate-required')
            tunnel = before['tunnel']
            base = urlsplit(before['baseUrl'])
            require(tunnel == after['tunnel'] and tunnel.get('server') == 'suneng-ecs-prod'
                    and tunnel.get('sourceCommit') == plan['sourceCommit']
                    and tunnel.get('sshSessionId') and base.hostname == '127.0.0.1'
                    and base.scheme == 'http' and base.port == tunnel.get('localPort')
                    and str(tunnel.get('remotePort')) == bindings[0]['HostPort'],
                    'same-container-tunnel-required')
        else:
            require(container.get('name') == '/corp-site-frontend'
                    and before['baseUrl'] == 'https://www.jssngyl.cn', 'actual-production-browser-required')
    contract = plan['browserContract']
    records = report.get('records')
    require(isinstance(records, list) and len(records) == len(contract), 'complete-browser-matrix-required')
    seen = set()
    for capture in records:
        key = capture['case']
        require(key in contract and key not in seen, 'duplicate-or-unapproved-browser-case')
        seen.add(key)
        expected = contract[key]
        raw_name = capture['recordFile']
        require(raw_name in report['boundFilesSha256'], 'browser-record-bytes-not-bound')
        data = load(root / relative(raw_name))
        require(data.get('method') == 'real-browser' and data.get('viewport') == expected['viewport']
                and data.get('rendered') is True and data.get('overflow') is False,
                'rendered-browser-viewport-required')
        url = urlsplit(data['url'])
        require(url.path == expected['path']
                and {k: v for k, v in parse_qs(url.query).items() if k != 'acquisition_qa'}
                == expected.get('query', {}), 'browser-route-or-query-mismatch')
        base = urlsplit(before['baseUrl'])
        require((url.scheme, url.hostname, url.port) == (base.scheme, base.hostname, base.port),
                'browser-origin-does-not-match-identity')
        require(start <= instant(data['at']) <= end, 'capture-outside-actual-image-window')
        require(data.get('assertions') == {key: True for key in expected['assertions']},
                'approved-browser-assertions-incomplete')
        if phase == 'production':
            qa = data.get('observations', {}).get('qa', {})
            require(qa.get('hostname') == 'www.jssngyl.cn'
                    and isinstance(qa.get('sessionId'), str) and qa['sessionId']
                    and qa.get('qaSession') == qa['sessionId']
                    and qa.get('localPreviewTrackingSuppressed') is False,
                    'actual-nonempty-production-qa-identity-required')
            require(parse_qs(url.query).get('acquisition_qa') == [plan['qaMarker']]
                    or data.get('qaSessionMatches') is True, 'production-qa-attribution-required')
        for name in (capture['screenshot'], capture['consoleFile'], capture['errorsFile']):
            require(name in report['boundFilesSha256'], 'capture-evidence-not-bound')
        require(not read(root / relative(capture['errorsFile'])).strip(), 'browser-errors-present')
        require(re.search(rb'hydrat|did not match|\[(error|warn(ing)?)\]',
                          read(root / relative(capture['consoleFile'])), re.I) is None,
                'browser-warning-present')
        png = read(root / relative(capture['screenshot']))
        require(png[:8] == b'\x89PNG\r\n\x1a\n' and len(png) > 1024, 'nonempty-real-PNG-required')
        width, height = struct.unpack('>II', png[16:24])
        require(width == expected['viewport']['width'] and height >= expected['viewport']['height'],
                'screenshot-viewport-mismatch')
    require(seen == set(contract), 'approved-browser-case-missing')
    return report
