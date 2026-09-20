#!/usr/bin/env python3
"""Apply an already imported, immutable frontend image; never build or change data.
The same operation is used for deployment and rollback. Old withdrawn-content
images must pass the canary contract before they can replace the public site.
"""
import argparse
import copy
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
import uuid
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

IMAGE = re.compile(r'^sha256:[0-9a-f]{64}$')
SHA = re.compile(r'^[0-9a-f]{40}$')
DIGEST = re.compile(r'^[0-9a-f]{64}$')
SLUG = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
PROTECTED = ['postgres', 'backend', 'admin', 'nginx']
SCOPE = 'news-products-services-company-reviewed-cases'
# Owner-approved public case pages. Must match frontend/src/lib/cases/public-case-allowlist.ts.
APPROVED_CASES = {
    'zh': ['henan-annealing-solution-line'],
    'en': ['henan-annealing-solution-line'],
}
NO_CASES = {'zh': [], 'en': []}
APPROVED_GUIDES = json.loads(Path(__file__).with_name('approved-guides.json').read_text())
# Representative unapproved drafts; they must stay private in every release state.
# A frontend test checks that each is still a draft. Replace one when it is approved.
DRAFT_CASE_PATHS = [
    '/zh/case/anonymous-tsingshan-1250-renovation',
    '/zh/case/jining-support-roller-heat-treatment-line',
    '/en/case/jining-support-roller-heat-treatment-line',
]
# Escaped or padded section names that the router still resolves to withdrawn
# pages; images before this release served the full pages at these addresses.
ENCODED_WITHDRAWN_PATHS = [
    '/zh/%73olutions/continuous-heat-treatment-line',
    '/zh/%61rticles/gongye-lu-baojia-canshu',
    '/zh/sol%09utions/continuous-heat-treatment-line',
    '/zh/%0Asolutions/continuous-heat-treatment-line',
    '/en/solutions%0D/continuous-heat-treatment-line',
    '/zh/art%09icles/gongye-lu-baojia-canshu',
    '/zh/solutions%20',
    '/en/solutions%1F',
    '/zh/products/%252e%252e/solutions/continuous-heat-treatment-line',
]
# Earlier frontend images that still serve withdrawn pages at those addresses.
# Only an owner-approved rollback to one of them may skip the encoded probes.
LEGACY_ENCODING_IMAGES = {
    'sha256:d8a49b0fef153e01712611d4cb8dc404cd2d804e3f34aa43426fea3127f1abb5',  # 642b7a2c
    'sha256:de534bb2b63afc7c6299089f17bc491007023539e2812da367be5f015a71f818',  # c1bda3ca, hotfix #79
}
CASE_STATES = ('open', 'closed')
PUBLIC_LIVE = ['/zh', '/en', '/zh/news', '/en/news', '/zh/inquiry', '/en/contact']
SITEMAP_NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
XHTML_NS = '{http://www.w3.org/1999/xhtml}'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def atomic_json(path, data):
    temporary = path.with_name(path.name + '.writing')
    with temporary.open('w') as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
        stream.flush()
        os.fsync(stream.fileno())
    temporary.replace(path)


def validate_manifest(value):
    admin_only = value.get('adminOnly', False)
    if not isinstance(admin_only, bool):
        raise ValueError('adminOnly must be a boolean')
    if admin_only and ('admin' not in value or 'backend' in value or
                       value.get('image') != value.get('expectedCurrentImage')):
        raise ValueError('An admin-only release must preserve the frontend and omit backend')
    if value.get('schemaVersion') != 1 or not IMAGE.fullmatch(value.get('image', '')):
        raise ValueError('Invalid release schema or immutable image identity')
    if not IMAGE.fullmatch(value.get('expectedCurrentImage', '')):
        raise ValueError('An explicit expected current image is required')
    if value.get('publicationScope') != SCOPE:
        raise ValueError('The release must retain the current withdrawal scope')
    if value.get('caseState', 'open') not in CASE_STATES:
        raise ValueError('Unknown case publication state')
    if 'approvedCases' in value:
        normalize_cases(value['approvedCases'])
    normalize_guides(value.get('approvedGuides', []))
    legacy = value.get('legacyEncodedPaths', False)
    if not isinstance(legacy, bool):
        raise ValueError('legacyEncodedPaths must be true or false')
    if legacy:
        approval = value.get('legacyEncodedPathsApproval')
        if not isinstance(approval, str) or not approval.strip() or len(approval) > 200:
            raise ValueError('Skipping encoded-path probes requires the recorded approval of the site owner')
        if value['image'] not in LEGACY_ENCODING_IMAGES:
            raise ValueError('Only a known earlier image may skip encoded-path probes')
    if value.get('sourceIdentity') == 'git-commit':
        if not SHA.fullmatch(value.get('sourceCommit', '')) or not DIGEST.fullmatch(value.get('archiveSha256', '')):
            raise ValueError('A Git release requires its source commit and archive hash')
    elif value.get('sourceIdentity') == 'frozen-snapshot':
        if not DIGEST.fullmatch(value.get('sourceManifestSha256', '')):
            raise ValueError('A historical release requires the original frozen source hash')
    else:
        raise ValueError('Unknown source identity')
    if 'backend' in value:
        backend = value['backend']
        if not isinstance(backend, dict) or set(backend) != {'image', 'expectedCurrentImage', 'archiveSha256'}:
            raise ValueError('Backend release requires exact image, previous image and archive hash')
        if value.get('sourceIdentity') != 'git-commit' or not all(IMAGE.fullmatch(backend[k]) for k in ['image', 'expectedCurrentImage']) or not DIGEST.fullmatch(backend['archiveSha256']):
            raise ValueError('Backend must share the reviewed Git source and use immutable images')
    if 'admin' in value:
        admin = value['admin']
        if not isinstance(admin, dict) or set(admin) != {'image', 'expectedCurrentImage', 'archiveSha256'}:
            raise ValueError('Admin release requires exact image, previous image and archive hash')
        if value.get('sourceIdentity') != 'git-commit' or not all(IMAGE.fullmatch(admin[k]) for k in ['image', 'expectedCurrentImage']) or not DIGEST.fullmatch(admin['archiveSha256']):
            raise ValueError('Admin must share the reviewed Git source and use immutable images')
    return value


def run(args, *, env=None, timeout=180):
    result = subprocess.run(args, text=True, capture_output=True, timeout=timeout, env=env)
    if result.returncode:
        # Docker output can include environment-derived values. Keep it out of public logs.
        raise RuntimeError('Release command failed: ' + args[0])
    return result.stdout.strip()


def inspect(services):
    return json.loads(run(['docker', 'inspect', *['corp-site-' + s for s in services]]))


def signature(rows):
    return sorted((row['Name'], row['Id'], row['Image'], row['State']['StartedAt']) for row in rows)


def assert_current(receipt, rows, expected):
    images = {row['Name'].removeprefix('/corp-site-'): row['Image'] for row in rows}
    if images['frontend'] != expected:
        raise RuntimeError('Production changed since this release was prepared')
    for service in ['frontend', 'backend', 'admin']:
        if receipt['images'].get(service) != images[service]:
            raise RuntimeError('Active receipt does not match running images')
    if not all(row['State']['Running'] for row in rows):
        raise RuntimeError('A production service is not running')


def normalize_cases(value):
    """Validate a {'zh': [...], 'en': [...]} list of approved case slugs."""
    if not isinstance(value, dict) or set(value) != {'zh', 'en'}:
        raise ValueError('Approved cases must list zh and en slugs')
    for slugs in value.values():
        if not isinstance(slugs, list) or not all(isinstance(slug, str) and SLUG.fullmatch(slug) for slug in slugs):
            raise ValueError('Approved cases must be lists of case slugs')
    if not set(value['en']) <= set(value['zh']):
        raise ValueError('An English case page requires its Chinese page to be approved')
    return {'zh': sorted(set(value['zh'])), 'en': sorted(set(value['en']))}


def normalize_guides(value):
    if not isinstance(value, list) or not all(isinstance(path, str) and path in APPROVED_GUIDES for path in value):
        raise ValueError('Only explicitly approved Chinese guide paths may be released')
    return sorted(set(value))


def merge_cases(*values):
    return {locale: sorted(set().union(*(value[locale] for value in values))) for locale in ('zh', 'en')}


def case_contract(state, cases=None, *, encoded=True, withdrawn=None, guides=None, withdrawn_guides=None, guide_state="open"):
    """Route rules for one case state.

    'open' and 'closed' describe the image being released, with `cases` listing
    the pages it is approved to serve. 'either' is used for the currently running
    or restored image; pass the union of the live and target lists so an earlier
    or later batch is accepted. Guides outside the exact approved list, section hubs and unapproved drafts
    are private in every state. `withdrawn` lists pages the new image must no longer
    serve. `encoded` also probes percent-escaped section names.
    """
    if state not in (*CASE_STATES, 'either'):
        raise ValueError('Unknown case publication state')
    cases = normalize_cases(APPROVED_CASES if cases is None else cases)
    group, retired = [], ['/zh/solutions', '/en/solutions', '/zh/articles', '/en/articles',
                          '/zh/articles/gongye-lu-baojia-canshu',
                          '/zh/solutions/continuous-heat-treatment-line',
                          '/zh/solutions/rechuli-lu-changjia',
                          '/zh/solutions/jiangsu-gongye-lu-changjia',
                          *[path.replace('/zh/', '/en/', 1) for path in APPROVED_GUIDES]]
    for locale in ('zh', 'en'):
        slugs = cases[locale]
        if slugs:
            group += [f'/{locale}/case', *[f'/{locale}/case/{slug}' for slug in slugs]]
        else:
            retired.append(f'/{locale}/case')
    drafts = [path for path in DRAFT_CASE_PATHS if path.rsplit('/', 1)[1] not in cases[path.split('/')[1]]]
    if withdrawn:
        withdrawn = normalize_cases(withdrawn)
        drafts += [f'/{locale}/case/{slug}' for locale in ('zh', 'en') for slug in withdrawn[locale]
                   if slug not in cases[locale] and f'/{locale}/case/{slug}' not in drafts]
    extra = []
    if encoded:
        extra = ENCODED_WITHDRAWN_PATHS + [path.replace('/zh/case/', '/zh/%63ase/', 1)
                                           for path in drafts if path.startswith('/zh/case/')][:1]
    guides = normalize_guides([] if guides is None else guides)
    if guide_state not in ('open', 'either'):
        raise ValueError('Unknown guide publication state')
    retired = [path for path in retired if path not in guides]
    retired += [path for path in sorted(set(APPROVED_GUIDES + (withdrawn_guides or []))) if path not in guides and path not in retired]
    return {'state': state, 'group': group, 'retired': retired + drafts + extra,
            'guides': {'state': guide_state, 'paths': guides}}


def case_group_failure(statuses, contract):
    """Return the first case path that breaks the contract, or None."""
    allowed = {'open': {200}, 'closed': {404}, 'either': {200, 404}}[contract['state']]
    for path in contract['group']:
        if statuses.get(path) not in allowed:
            return path
    # A case page is never public while its locale's hub is withdrawn.
    for path in contract['group']:
        hub = '/'.join(path.split('/')[:3])
        if path != hub and statuses.get(path) == 200 and statuses.get(hub) != 200:
            return path
    return None


def sitemap_passes(urls, located, statuses, contract):
    """urls: every <loc> and alternate href; located: <loc> values only."""
    paths = {urlparse(url).path for url in located}
    if not {'/zh/news', '/en/news'} <= paths:
        return False
    for url in urls:
        parsed = urlparse(url)
        if re.search(r'/(articles|solutions)(/|$)', parsed.path):
            if parsed.query or parsed.path not in contract.get('guides', {}).get('paths', []) or statuses.get(parsed.path) != 200:
                return False
        if re.search(r'/case(/|$)', parsed.path):
            if parsed.query or parsed.path not in contract['group'] or statuses.get(parsed.path) != 200:
                return False
    guides = contract.get('guides', {'state': 'open', 'paths': []})
    if any(statuses.get(path) == 200 and path not in paths for path in guides['paths']):
        return False
    return contract['state'] != 'open' or all(path in paths for path in contract['group'])


def sitemap_urls(xml):
    """Page addresses and their language alternates, as check-frontend.cjs reads them.
    Image and other extension entries are not pages."""
    root = ET.fromstring(xml)
    located = [loc.text or '' for url in root.iter(SITEMAP_NS + 'url') for loc in url.findall(SITEMAP_NS + 'loc')]
    alternates = [link.get('href', '') for link in root.iter(XHTML_NS + 'link')]
    return located, alternates


def probe(container, script, contract):
    raw = run(['docker', 'exec', '-e', 'RELEASE_CASE_CONTRACT=' + json.dumps(contract),
               container, 'node', '-e', script], timeout=300)
    report = json.loads(raw)
    if report.get('passed') is not True or report.get('sitemapPassed') is not True:
        raise RuntimeError('Candidate violates the public route or sitemap contract')
    if report.get('caseState') != contract['state']:
        raise RuntimeError('Candidate was checked against a different case contract')
    return report


def wait_healthy(container):
    for _ in range(60):
        row = json.loads(run(['docker', 'inspect', container]))[0]
        if row['State'].get('Health', {}).get('Status') == 'healthy':
            return
        if not row['State']['Running']:
            raise RuntimeError('Candidate exited before becoming healthy')
        time.sleep(2)
    raise RuntimeError('Candidate health check timed out')


def admin_assets(fetch, require_filter=True):
    """Read public static assets only; never log in or submit an inquiry action."""
    html = fetch('/')
    paths = sorted(set(re.findall(r'(?:src|href)=[\"\'](/assets/[A-Za-z0-9_.-]+\.(?:js|css))[\"\']', html)))
    if not paths or not any(path.endswith('.js') for path in paths):
        raise RuntimeError('Admin entry has no valid application assets')
    assets = {path: fetch(path) for path in paths}
    # Vite loads the inquiry page lazily; follow its entry-bundle reference.
    for name in sorted(set(re.findall(r'CustomRequirementPage-[A-Za-z0-9_-]+\.js', '\n'.join(assets.values())))):
        path = '/assets/' + name
        assets[path] = fetch(path)
    if any(not body.strip() or body.lstrip().lower().startswith('<!doctype') for body in assets.values()):
        raise RuntimeError('Admin static asset is missing or returned the HTML fallback')
    javascript = '\n'.join(body for path, body in assets.items() if path.endswith('.js'))
    if require_filter and not ('只看通知未送达' in javascript and 'undelivered' in javascript):
        raise RuntimeError('Admin inquiry filter is absent from the application bundle')
    if fetch('/inquiry-contract-version.txt').strip() != '2':
        raise RuntimeError('Admin inquiry contract is incompatible')
    return {'passed': True, 'filterBundleVerified': require_filter,
            'assets': {path: hashlib.sha256(body.encode()).hexdigest() for path, body in assets.items()},
            'authenticatedInteractionVerified': False, 'notificationsSent': False}


def admin_probe(container=None, require_filter=True):
    def fetch(path):
        if container:
            return run(['docker', 'exec', container, 'wget', '-qO-', 'http://127.0.0.1' + path])
        return run(['curl', '--fail', '--max-time', '25', '--silent', '--show-error',
                    'https://admin.jssngyl.cn' + path])
    return admin_assets(fetch, require_filter)


def admin_cache_probe(container=None):
    """Check entry headers and a definitely absent bundle without authentication."""
    checks = []
    for path in ['/', '/index.html', '/login', '/custom-requirements',
                 '/assets/__suneng_cache_probe_missing__.js']:
        # BusyBox wget stops before printing headers on a 404. The admin image
        # already includes curl, which preserves error-response headers.
        request = ['curl', '--silent', '--show-error', '--max-time', '20',
                   '-D', '-', '-o', '/dev/null']
        command = (['docker', 'exec', container, *request, 'http://127.0.0.1' + path]
                   if container else [*request, 'https://admin.jssngyl.cn' + path])
        response = subprocess.run(command, text=True, capture_output=True, timeout=25)
        headers = response.stdout + response.stderr
        status = re.search(r'HTTP/\S+\s+(\d{3})', headers)
        cache = ', '.join(re.findall(r'^\s*cache-control:\s*(.+)', headers, re.I | re.M)).strip()
        robots = re.search(r'^\s*x-robots-tag:\s*noindex, nofollow\s*$', headers, re.I | re.M)
        expected = 404 if path.endswith('.js') else 200
        if response.returncode != 0 or not status or int(status[1]) != expected or not robots:
            raise RuntimeError('Admin cache response failed: ' + path)
        if (expected == 200 and 'no-store' not in cache.lower()) or (
                expected == 404 and 'immutable' in cache.lower()):
            raise RuntimeError('Admin cache policy failed: ' + path)
        checks.append({'path': path, 'status': expected, 'cacheControl': cache})
    return checks


def public_probe(base_url, contract):
    def status_of(path):
        return run(['curl', '--max-time', '25', '--silent', '--show-error', '--output',
                    '/dev/null', '--write-out', '%{http_code}', base_url + path])
    results, statuses = [], {}
    for path, expected in [*[(p, 200) for p in PUBLIC_LIVE], *[(p, 404) for p in contract['retired']]]:
        status = status_of(path)
        if status != str(expected):
            raise RuntimeError('Public route check failed: ' + path)
        results.append({'path': path, 'status': expected})
    for path in contract['group']:
        status = status_of(path)
        statuses[path] = int(status) if status.isdigit() else 0
    failed = case_group_failure(statuses, contract)
    if failed:
        raise RuntimeError('Public case route check failed: ' + failed)
    results += [{'path': path, 'status': status} for path, status in statuses.items()]
    guides = contract.get('guides', {'state': 'open', 'paths': []})
    for path in guides['paths']:
        status = int(status_of(path))
        if status not in ({200} if guides['state'] == 'open' else {200, 404}):
            raise RuntimeError('Public guide route check failed: ' + path)
        statuses[path] = status
        results.append({'path': path, 'status': status})
    xml = run(['curl', '--fail', '--max-time', '25', '--silent', '--show-error', base_url + '/sitemap.xml'])
    located, alternates = sitemap_urls(xml)
    if not sitemap_passes(located + alternates, located, statuses, contract):
        raise RuntimeError('Public sitemap does not match the case publication contract')
    return results


class Release:
    def __init__(self, live, audit, manifest, health_script):
        self.live, self.audit = live, audit
        self.manifest = validate_manifest(manifest)
        self.admin_only = manifest.get('adminOnly', False)
        self.script = health_script
        self.receipt_path = live / 'RELEASE_ARTIFACTS.json'
        self.pins_path = live / 'verified-images.override.yml'
        self.pending_path = live / 'DEPLOYMENT_IN_PROGRESS.json'
        self.receipt = json.loads(self.receipt_path.read_text())
        # Case pages served by the image being released, and by the live image
        # (older receipts predate case approval and serve none).
        self.served_guides = normalize_guides(manifest.get('approvedGuides', []))
        previous_guides = normalize_guides(self.receipt.get('frontendRelease', {}).get('servedGuides', []))
        self.previous_guides = previous_guides
        target_cases = normalize_cases(manifest.get('approvedCases', APPROVED_CASES))
        self.served_cases = target_cases if manifest.get('caseState', 'open') == 'open' else NO_CASES
        self.live_cases = normalize_cases((self.receipt.get('frontendRelease') or {}).get('servedCases', NO_CASES))
        self.target_contract = case_contract(manifest.get('caseState', 'open'), target_cases,
                                             encoded=not manifest.get('legacyEncodedPaths', False), guides=self.served_guides, withdrawn_guides=previous_guides,
                                             withdrawn=self.live_cases)
        self.lenient_contract = case_contract('either', merge_cases(target_cases, self.live_cases), encoded=False, guides=sorted(set(previous_guides + self.served_guides)), guide_state='either')
        self.original_marker = (live / 'DEPLOY_COMMIT').read_bytes() if (live / 'DEPLOY_COMMIT').exists() else None
        self.env = {**os.environ}
        if manifest.get('sourceCommit'):
            self.env['DEPLOY_COMMIT'] = manifest['sourceCommit']
        self.override = audit / 'target.override.json'
        self.target = copy.deepcopy(self.receipt['images'])
        self.target['frontend'] = manifest['image']
        self.components = [] if self.admin_only else ['frontend']
        self.protected = list(PROTECTED)
        if self.admin_only:
            self.protected.append('frontend')
            # The unchanged frontend keeps its own publication contract and identity.
            self.served_cases = self.live_cases
            self.served_guides = self.previous_guides
            self.target_contract = case_contract('open' if any(self.live_cases.values()) else 'closed',
                                                 self.live_cases, guides=self.previous_guides)
            self.lenient_contract = self.target_contract
        if 'backend' in manifest:
            self.target['backend'] = manifest['backend']['image']
            self.components = ['backend', 'frontend']
            self.protected.remove('backend')
        if 'admin' in manifest:
            self.target['admin'] = manifest['admin']['image']
            self.components.append('admin')
            self.protected.remove('admin')

    def compose(self, override=None):
        return ['docker', 'compose', '-p', 'website', '--project-directory', str(self.live),
                '--env-file', str(self.live / '.env.production'), '-f',
                str(self.live / 'docker-compose.prod.yml'), '-f', str(override or self.override)]

    def write_override(self, path, images):
        atomic_json(path, {'services': {name: {'image': image, 'pull_policy': 'never'}
                                       for name, image in images.items()}})

    def replace_frontend(self, override=None):
        # The historical method name is kept for frontend-only callers and tests.
        for service in self.components:
            run(self.compose(override) + ['up', '-d', '--no-deps', '--no-build', '--pull', 'never', service], env=self.env)
            wait_healthy('corp-site-' + service)
        run(['docker', 'exec', 'corp-site-nginx', 'nginx', '-t'])
        run(['docker', 'exec', 'corp-site-nginx', 'nginx', '-s', 'reload'])

    def backend_check(self, migrate=False, running=False):
        script = Path(__file__).with_name('check-backend.cjs').read_text()
        if running:
            command = ['docker', 'exec', 'corp-site-backend', 'node', '-e', script]
        else:
            # Run only a bounded read/check command. Never start the inquiry notification worker twice.
            command = self.compose() + ['run', '--rm', '--no-deps', '--pull', 'never',
                       '-e', 'RELEASE_APPLY_INDEX=' + ('1' if migrate else '0'),
                       '--entrypoint', 'node', 'backend', '-e', script]
        report = json.loads(run(command, env=self.env, timeout=180))
        if report.get('passed') is not True:
            raise RuntimeError('Backend aggregate or migration verification failed')
        return report

    def admin_check(self, require_cache=False):
        canary = 'suneng-admin-check-' + uuid.uuid4().hex[:12]
        try:
            run(self.compose() + ['run', '-d', '--no-deps', '--pull', 'never',
                                 '--name', canary, 'admin'], env=self.env)
            wait_healthy(canary)
            result = admin_probe(canary)
            if require_cache:
                result['cacheChecks'] = admin_cache_probe(canary)
            return result
        finally:
            subprocess.run(['docker', 'rm', '-f', canary], capture_output=True, timeout=30)

    def execute(self, apply=False, kind='deploy'):
        if self.manifest.get('legacyEncodedPaths') and kind != 'rollback':
            raise RuntimeError('Encoded-path probes may be skipped only for an owner-approved rollback')
        if self.pending_path.exists() or self.pending_path.is_symlink():
            raise RuntimeError('An interrupted deployment requires reconciliation before another attempt')
        if (self.live / '.DO_NOT_DEPLOY').exists() or (self.live / '.DO_NOT_DEPLOY').is_symlink():
            raise RuntimeError('This checkout is explicitly blocked from deployment')
        if shutil.disk_usage(self.live).free < 2 * 1024**3:
            raise RuntimeError('Two GiB working reserve required for an already imported image')
        before = inspect(PROTECTED + ['frontend'])
        assert_current(self.receipt, before, self.manifest['expectedCurrentImage'])
        protected = signature([r for r in before if r['Name'].removeprefix('/corp-site-') in self.protected])
        if 'backend' in self.manifest and self.receipt['images']['backend'] != self.manifest['backend']['expectedCurrentImage']:
            raise RuntimeError('Backend changed since this release was prepared')
        image = json.loads(run(['docker', 'image', 'inspect', self.manifest['image']]))[0]
        if image['Id'] != self.manifest['image']:
            raise RuntimeError('Target did not resolve to the exact imported image')
        if self.manifest.get('sourceIdentity') == 'git-commit':
            source = (self.receipt.get('frontendRelease', {}).get('sourceCommit')
                      if self.admin_only else self.manifest['sourceCommit'])
            if not source or (image.get('Config', {}).get('Labels') or {}).get('org.opencontainers.image.revision') != source:
                raise RuntimeError('Image was not built from the recorded source commit')
        self.write_override(self.override, self.target)
        if 'backend' in self.manifest:
            backend_image = json.loads(run(['docker', 'image', 'inspect', self.target['backend']]))[0]
            if backend_image['Id'] != self.target['backend'] or (backend_image.get('Config', {}).get('Labels') or {}).get('org.opencontainers.image.revision') != self.manifest['sourceCommit']:
                raise RuntimeError('Backend image was not built from the same reviewed source')
            self.backend_check()
        admin_candidate = None
        if 'admin' in self.manifest:
            if self.receipt['images']['admin'] != self.manifest['admin']['expectedCurrentImage']:
                raise RuntimeError('Admin changed since this release was prepared')
            admin_image = json.loads(run(['docker', 'image', 'inspect', self.target['admin']]))[0]
            if admin_image['Id'] != self.target['admin'] or (admin_image.get('Config', {}).get('Labels') or {}).get('org.opencontainers.image.revision') != self.manifest['sourceCommit']:
                raise RuntimeError('Admin image was not built from the same reviewed source')
            admin_candidate = self.admin_check(require_cache=self.admin_only and kind != 'rollback')
        same = all(self.target[name] == self.receipt['images'][name] for name in self.components)
        canary = 'suneng-release-check-' + uuid.uuid4().hex[:12]
        if same or self.admin_only:
            internal = probe('corp-site-frontend', self.script, self.target_contract)
        else:
            try:
                run(self.compose() + ['run', '-d', '--no-deps', '--pull', 'never',
                                     '--name', canary, 'frontend'], env=self.env)
                wait_healthy(canary)
                internal = probe(canary, self.script, self.target_contract)
            finally:
                # This uniquely named canary is the only container cleanup permitted here.
                subprocess.run(['docker', 'rm', '-f', canary], capture_output=True, timeout=30)
        if signature(inspect(self.protected)) != protected:
            raise RuntimeError('A protected production service changed during preflight')
        result = {'at': now(), 'passed': True, 'applied': False, 'kind': kind,
                  'image': self.target['frontend'], 'internalChecks': internal,
                  'dataRestored': False, 'notificationsSent': False, 'components': self.components}
        if admin_candidate:
            result['adminCandidate'] = admin_candidate
        if not apply or same:
            # Without a switch the public site still runs the current image.
            result['publicChecks'] = public_probe('https://www.jssngyl.cn', self.target_contract if same else self.lenient_contract)
            atomic_json(self.audit / 'preflight.json', result)
            return result
        # Re-check the expected current version immediately before replacement.
        current = inspect(PROTECTED + ['frontend'])
        assert_current(self.receipt, current, self.manifest['expectedCurrentImage'])
        if signature([row for row in current if row['Name'].removeprefix('/corp-site-') in self.protected]) != protected:
            raise RuntimeError('A protected production service changed before replacement')
        atomic_json(self.audit / 'previous-receipt.json', self.receipt)
        self.write_override(self.audit / 'previous.override.json', self.receipt['images'])
        atomic_json(self.pending_path, {'at': now(), 'auditDirectory': str(self.audit),
                                       'previousImages': self.receipt['images'], 'targetImages': self.target,
                                       'previousServedCases': self.live_cases, 'targetServedCases': self.served_cases,
                                       'previousServedGuides': self.previous_guides, 'targetServedGuides': self.served_guides})
        try:
            if 'backend' in self.manifest:
                result['backendMigration'] = self.backend_check(migrate=True)
            self.replace_frontend()
            if 'backend' in self.manifest:
                result['backendVerification'] = self.backend_check(running=True)
            result['internalChecks'] = probe('corp-site-frontend', self.script, self.target_contract)
            result['publicChecks'] = public_probe('https://www.jssngyl.cn', self.target_contract)
            if 'admin' in self.manifest:
                result['adminPublic'] = admin_probe()
                if self.admin_only and kind != 'rollback':
                    result['adminPublic']['cacheChecks'] = admin_cache_probe()
                if result['adminPublic']['assets'] != admin_candidate['assets']:
                    raise RuntimeError('Public admin assets do not match the checked candidate')
            if signature(inspect(self.protected)) != protected:
                raise RuntimeError('A protected production service changed')
            if any(row['Image'] != self.target[row['Name'].removeprefix('/corp-site-')] for row in inspect(self.components)):
                raise RuntimeError('Running frontend identity does not match target')
            receipt = copy.deepcopy(self.receipt)
            receipt.update({'images': self.target, 'sourceIdentity': 'component-release',
                            **({} if self.admin_only else {'frontendRelease': {**self.manifest, 'servedCases': self.served_cases, **({'servedGuides': self.served_guides} if self.served_guides else {})}}),
                            'previousReceipt': str(self.audit / 'previous-receipt.json'),
                            'productionVerifiedAt': now(), 'deploymentStatus': 'verified',
                            'releaseOperation': kind, 'releaseOperationReceipt': str(self.audit / 'result.json')})
            if 'admin' in self.manifest:
                receipt['adminRelease'] = {**self.manifest['admin'], 'sourceCommit': self.manifest['sourceCommit'],
                                           'sourceIdentity': 'git-commit', 'publicAssets': result['adminPublic']['assets']}
            self.write_override(self.pins_path, self.target)
            atomic_json(self.receipt_path, receipt)
            # Version marker refers to the checked-in source of a newly built image only.
            if self.manifest.get('sourceCommit') and not self.admin_only:
                marker = self.live / 'DEPLOY_COMMIT.next'
                marker.write_text(self.manifest['sourceCommit'] + '\n')
                marker.replace(self.live / 'DEPLOY_COMMIT')
            self.pending_path.unlink()
            result['applied'] = True
        except Exception as error:
            result.update({'passed': False, 'failureType': type(error).__name__})
            try:
                self.replace_frontend(self.audit / 'previous.override.json')
                if any(row['Image'] != self.receipt['images'][row['Name'].removeprefix('/corp-site-')] for row in inspect(self.components)):
                    raise RuntimeError('Recovery did not restore the previous image')
                # The restored image may predate the approved cases.
                probe('corp-site-frontend', self.script, self.lenient_contract)
                public_probe('https://www.jssngyl.cn', self.lenient_contract)
                if 'admin' in self.manifest:
                    if admin_probe('corp-site-admin', require_filter=False)['assets'] != admin_probe(require_filter=False)['assets']:
                        raise RuntimeError('Public admin assets did not return to the previous image')
                if signature(inspect(self.protected)) != protected:
                    raise RuntimeError('Protected services changed during recovery')
                self.write_override(self.pins_path, self.receipt['images'])
                atomic_json(self.receipt_path, self.receipt)
                if self.original_marker is not None:
                    marker = self.live / 'DEPLOY_COMMIT.recovering'
                    marker.write_bytes(self.original_marker)
                    marker.replace(self.live / 'DEPLOY_COMMIT')
                elif (self.live / 'DEPLOY_COMMIT').exists():
                    (self.live / 'DEPLOY_COMMIT').unlink()
                self.pending_path.unlink()
                result['previousFrontendRestoredAndVerified'] = True
                if 'admin' in self.manifest:
                    result['previousAdminRestoredAndVerified'] = True
            except Exception:
                # Leave an explicit pending marker and accurate image identity, never a false success.
                observed = {row['Name'].removeprefix('/corp-site-'): row['Image'] for row in inspect(['frontend', 'backend', 'admin'])}
                failed = copy.deepcopy(self.receipt)
                failed.update({'images': observed, 'deploymentStatus': 'recovery-required', 'releaseOperationReceipt': str(self.audit / 'result.json')})
                # Describe the cases of the frontend that is actually running.
                if observed.get('frontend') != self.receipt['images']['frontend']:
                    if observed.get('frontend') == self.target['frontend']:
                        failed['frontendRelease'] = {**self.manifest, 'servedCases': self.served_cases, **({'servedGuides': self.served_guides} if self.served_guides else {})}
                    else:
                        failed['frontendRelease'] = {**(self.receipt.get('frontendRelease') or {}),
                                                     'servedCases': merge_cases(self.live_cases, self.served_cases),
                                                     'servedCasesUnverified': True,
                                                     **({'servedGuides': sorted(set(self.previous_guides + self.served_guides)),
                                                         'servedGuidesUnverified': True} if self.previous_guides or self.served_guides else {})}
                self.write_override(self.pins_path, observed)
                atomic_json(self.receipt_path, failed)
                result['previousFrontendRestoredAndVerified'] = False
                if 'admin' in self.manifest:
                    failed['adminRelease'] = {'image': observed['admin'], 'verificationRequired': True}
                    atomic_json(self.receipt_path, failed)
                    result['previousAdminRestoredAndVerified'] = False
            atomic_json(self.audit / 'result.json', result)
            raise RuntimeError('Release failed; see the private operation receipt') from error
        atomic_json(self.audit / 'result.json', result)
        return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--live', type=Path, default=Path('/opt/website'))
    parser.add_argument('--audit-root', type=Path, default=Path('/data/migration-rehearsals/release-ops'))
    parser.add_argument('--apply', action='store_true', help='Replace the frontend and optional explicitly manifested backend')
    parser.add_argument('--kind', choices=['deploy', 'rollback'], default='deploy')
    parser.add_argument('--failure-webhook-file', type=Path,
                        help='Owner-only Feishu credential file; failure notices only on --apply')
    args = parser.parse_args()
    os.umask(0o077)
    manifest = validate_manifest(json.loads(args.manifest.read_text()))
    webhook = None
    if args.failure_webhook_file:
        from deployment_notice import read_webhook
        webhook = read_webhook(args.failure_webhook_file)
    with open('/var/lock/corp-site-deploy.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        audit = args.audit_root / (datetime.datetime.now().strftime('%Y%m%d-%H%M%S-') + uuid.uuid4().hex[:8])
        audit.mkdir(parents=True)
        script = Path(__file__).with_name('check-frontend.cjs').read_text()
        release = Release(args.live, audit, manifest, script)
        print(json.dumps(execute_with_notice(release, args.apply, args.kind, webhook)))


def execute_with_notice(release, apply, kind, webhook=None):
    try:
        return release.execute(apply, kind)
    except Exception:
        if apply and webhook:
            from deployment_notice import send
            try:
                receipt = send(webhook, kind=kind)
            except Exception:
                receipt = {'platformAccepted': False, 'humanReceiptVerified': False}
                print('Deployment failed and its notification was not accepted.', file=sys.stderr)
            # A notification or receipt-writing failure must not hide release failure.
            try:
                atomic_json(release.audit / 'failure-notification.json', receipt)
            except OSError:
                print('Could not persist notification receipt.', file=sys.stderr)
        raise


if __name__ == '__main__':
    main()
