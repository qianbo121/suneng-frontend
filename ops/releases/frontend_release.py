#!/usr/bin/env python3
"""Apply an already imported, immutable frontend image; never build or change data.
The same operation is used for deployment and rollback. Old withdrawn-content
images must pass the canary contract before they can replace the public site.
"""
import argparse
import copy
import datetime
import fcntl
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
PROTECTED = ['postgres', 'backend', 'admin', 'nginx']
SCOPE = 'news-products-services-company'


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
    if value.get('schemaVersion') != 1 or not IMAGE.fullmatch(value.get('image', '')):
        raise ValueError('Invalid release schema or immutable image identity')
    if not IMAGE.fullmatch(value.get('expectedCurrentImage', '')):
        raise ValueError('An explicit expected current image is required')
    if value.get('publicationScope') != SCOPE:
        raise ValueError('The release must retain the current withdrawal scope')
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


def probe(container, script):
    raw = run(['docker', 'exec', container, 'node', '-e', script], timeout=300)
    report = json.loads(raw)
    if report.get('passed') is not True or report.get('sitemapPassed') is not True:
        raise RuntimeError('Candidate violates the public route or sitemap contract')
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


def public_probe(base_url):
    results = []
    for path, expected in [('/zh', 200), ('/en', 200), ('/zh/news', 200), ('/en/news', 200),
                           ('/zh/inquiry', 200), ('/en/contact', 200), ('/zh/case', 404),
                           ('/en/case', 404), ('/zh/solutions', 404), ('/en/solutions', 404)]:
        status = run(['curl', '--max-time', '25', '--silent', '--show-error', '--output',
                      '/dev/null', '--write-out', '%{http_code}', base_url + path])
        if status != str(expected):
            raise RuntimeError('Public route check failed: ' + path)
        results.append({'path': path, 'status': expected})
    xml = run(['curl', '--fail', '--max-time', '25', '--silent', '--show-error', base_url + '/sitemap.xml'])
    locations = [element.text or '' for element in ET.fromstring(xml).iter() if element.tag.rsplit('}', 1)[-1] == 'loc']
    if not all(any(url.endswith(path) for url in locations) for path in ['/zh/news', '/en/news']):
        raise RuntimeError('Public sitemap is incomplete')
    if any(re.search(r'/(case|articles|solutions)(/|$)', urlparse(url).path) for url in locations):
        raise RuntimeError('Public sitemap exposes withdrawn content')
    return results


class Release:
    def __init__(self, live, audit, manifest, health_script):
        self.live, self.audit = live, audit
        self.manifest = validate_manifest(manifest)
        self.script = health_script
        self.receipt_path = live / 'RELEASE_ARTIFACTS.json'
        self.pins_path = live / 'verified-images.override.yml'
        self.pending_path = live / 'DEPLOYMENT_IN_PROGRESS.json'
        self.receipt = json.loads(self.receipt_path.read_text())
        self.original_marker = (live / 'DEPLOY_COMMIT').read_bytes() if (live / 'DEPLOY_COMMIT').exists() else None
        self.env = {**os.environ}
        if manifest.get('sourceCommit'):
            self.env['DEPLOY_COMMIT'] = manifest['sourceCommit']
        self.override = audit / 'target.override.json'
        self.target = copy.deepcopy(self.receipt['images'])
        self.target['frontend'] = manifest['image']
        self.components = ['frontend']
        self.protected = list(PROTECTED)
        if 'backend' in manifest:
            self.target['backend'] = manifest['backend']['image']
            self.components = ['backend', 'frontend']
            self.protected.remove('backend')

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

    def execute(self, apply=False, kind='deploy'):
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
            if (image.get('Config', {}).get('Labels') or {}).get('org.opencontainers.image.revision') != self.manifest['sourceCommit']:
                raise RuntimeError('Image was not built from the recorded source commit')
        self.write_override(self.override, self.target)
        if 'backend' in self.manifest:
            backend_image = json.loads(run(['docker', 'image', 'inspect', self.target['backend']]))[0]
            if backend_image['Id'] != self.target['backend'] or (backend_image.get('Config', {}).get('Labels') or {}).get('org.opencontainers.image.revision') != self.manifest['sourceCommit']:
                raise RuntimeError('Backend image was not built from the same reviewed source')
            self.backend_check()
        same = all(self.target[name] == self.receipt['images'][name] for name in self.components)
        canary = 'suneng-release-check-' + uuid.uuid4().hex[:12]
        if same:
            internal = probe('corp-site-frontend', self.script)
        else:
            try:
                run(self.compose() + ['run', '-d', '--no-deps', '--pull', 'never',
                                     '--name', canary, 'frontend'], env=self.env)
                wait_healthy(canary)
                internal = probe(canary, self.script)
            finally:
                # This uniquely named canary is the only container cleanup permitted here.
                subprocess.run(['docker', 'rm', '-f', canary], capture_output=True, timeout=30)
        if signature(inspect(self.protected)) != protected:
            raise RuntimeError('A protected production service changed during preflight')
        result = {'at': now(), 'passed': True, 'applied': False, 'kind': kind,
                  'image': self.target['frontend'], 'internalChecks': internal,
                  'dataRestored': False, 'notificationsSent': False, 'components': self.components}
        if not apply or same:
            result['publicChecks'] = public_probe('https://www.jssngyl.cn')
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
                                       'previousImages': self.receipt['images'], 'targetImages': self.target})
        try:
            if 'backend' in self.manifest:
                result['backendMigration'] = self.backend_check(migrate=True)
            self.replace_frontend()
            if 'backend' in self.manifest:
                result['backendVerification'] = self.backend_check(running=True)
            result['internalChecks'] = probe('corp-site-frontend', self.script)
            result['publicChecks'] = public_probe('https://www.jssngyl.cn')
            if signature(inspect(self.protected)) != protected:
                raise RuntimeError('A protected production service changed')
            if any(row['Image'] != self.target[row['Name'].removeprefix('/corp-site-')] for row in inspect(self.components)):
                raise RuntimeError('Running frontend identity does not match target')
            receipt = copy.deepcopy(self.receipt)
            receipt.update({'images': self.target, 'sourceIdentity': 'component-release',
                            'frontendRelease': self.manifest, 'previousReceipt': str(self.audit / 'previous-receipt.json'),
                            'productionVerifiedAt': now(), 'deploymentStatus': 'verified',
                            'releaseOperation': kind, 'releaseOperationReceipt': str(self.audit / 'result.json')})
            self.write_override(self.pins_path, self.target)
            atomic_json(self.receipt_path, receipt)
            # Version marker refers to the checked-in source of a newly built image only.
            if self.manifest.get('sourceCommit'):
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
                probe('corp-site-frontend', self.script)
                public_probe('https://www.jssngyl.cn')
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
            except Exception:
                # Leave an explicit pending marker and accurate image identity, never a false success.
                observed = {row['Name'].removeprefix('/corp-site-'): row['Image'] for row in inspect(['frontend', 'backend', 'admin'])}
                failed = copy.deepcopy(self.receipt)
                failed.update({'images': observed, 'deploymentStatus': 'recovery-required', 'releaseOperationReceipt': str(self.audit / 'result.json')})
                self.write_override(self.pins_path, observed)
                atomic_json(self.receipt_path, failed)
                result['previousFrontendRestoredAndVerified'] = False
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
