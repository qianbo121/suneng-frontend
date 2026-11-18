"""Keep a verified candidate serving while Compose replaces the named frontend.

The temporary upstream is restored byte for byte, including on recovery. Never
remove a serving copy until the old proxy workers have drained. An interrupted
operation retains its copy and private recovery files behind the release hold.
"""
import base64
import json
import os
from pathlib import Path
import re
import time
import uuid


UPSTREAM = re.compile(rb'(upstream\s+frontend_upstream\s*\{\s*server\s+)frontend:3000(;\s*\})')
ACTIVE = '/etc/nginx/nginx.conf'
BOUND = '/etc/nginx/nginx.conf.template'


class HandoffRestored(RuntimeError):
    frontend_preserved = True


def redirect_frontend(config, hostname):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,62}', hostname) or len(UPSTREAM.findall(config)) != 1:
        raise RuntimeError('Frontend upstream is not the expected single service')
    return UPSTREAM.sub(lambda m: m[1] + hostname.encode() + b':3000' + m[2], config)


class Handoff:
    def __init__(self, live, audit, compose, env, command, healthy, verify,
                 *, target_image=None, frontend='corp-site-frontend', proxy='corp-site-nginx', drain_seconds=90):
        self.live, self.audit = Path(live), Path(audit)
        self.compose, self.env = list(compose), dict(env)
        self.run, self.healthy, self.verify = command, healthy, verify
        self.frontend, self.proxy, self.drain_seconds = frontend, proxy, drain_seconds
        self.target_image = target_image
        self.name = 'suneng-frontend-handoff-' + uuid.uuid4().hex[:12]
        self.directory = self.audit / self.name
        self.template = self.live / 'nginx.prod.conf.template'
        self.created = False
        self.touched = False
        self.canonical_attempted = False
        self.copy_id = None

    def read_active(self):
        return base64.b64decode(self.run(['docker', 'exec', self.proxy, 'base64', ACTIVE]))

    def inspect(self, name):
        return json.loads(self.run(['docker', 'inspect', name]))[0]

    def note(self, stage):
        # Evidence contains identities and stages, never environment values.
        with (self.directory / 'events.jsonl').open('a') as stream:
            stream.write(json.dumps({'at':time.time(), 'stage':stage, 'copy':self.name,
                                     'copyId':self.copy_id}) + '\n')
            stream.flush()
            os.fsync(stream.fileno())

    def workers(self):
        output = self.run(['docker', 'exec', self.proxy, 'ps', '-o', 'pid,args'])
        return {line.split()[0] for line in output.splitlines()
                if re.search(r'^\s*\d+\s+nginx: worker process(?:\s|$)', line)}

    def drain(self, old, require_new=False):
        limit = time.monotonic() + self.drain_seconds
        saw_new = not require_new
        while time.monotonic() < limit:
            current = self.workers()
            saw_new |= bool(current - old)
            if saw_new and current and not current.intersection(old):
                return
            time.sleep(.2)
        raise RuntimeError('Proxy workers did not drain; keep the serving copy')

    def write_template(self, content):
        # The template is bind-mounted. Atomic replacement would leave the
        # container bound to the old inode, so keep that inode intact.
        before = self.template.stat()
        with self.template.open('r+b') as stream:
            stream.write(content); stream.truncate(); stream.flush(); os.fsync(stream.fileno())
        if self.template.stat().st_ino != before.st_ino:
            raise RuntimeError('Bound proxy template identity changed')

    def activate(self, template, active, label):
        row = self.inspect(self.proxy)
        if row['Id'] != self.proxy_id or not row['State']['Running']:
            raise RuntimeError('Proxy identity changed during handoff')
        if self.read_active() != self.expected_active or self.template.read_bytes() != self.expected_template:
            raise RuntimeError('Proxy configuration changed outside this handoff')
        old = self.workers()
        if not old:
            raise RuntimeError('Cannot identify active proxy workers')
        source = self.directory / (label + '.conf')
        source.write_bytes(active)
        stage = '/etc/nginx/.' + self.name + '.conf'
        self.run(['docker', 'cp', str(source), self.proxy + ':' + stage])
        self.run(['docker', 'exec', self.proxy, 'nginx', '-t', '-c', stage])
        self.touched = True
        self.write_template(template)
        self.expected_template = template
        self.run(['docker', 'exec', self.proxy, 'sh', '-c',
                  'chmod "$(stat -c %a "$1")" "$2" && chown "$(stat -c %u:%g "$1")" "$2" && mv "$2" "$1"',
                  'sh', ACTIVE, stage])
        self.expected_active = active
        self.run(['docker', 'exec', self.proxy, 'nginx', '-s', 'reload'])
        self.drain(old, require_new=True)
        if self.read_active() != active or self.template.read_bytes() != template:
            raise RuntimeError('Proxy handoff bytes changed')
        self.note(label)

    def prepare(self):
        self.directory.mkdir(mode=0o700)
        row = self.inspect(self.frontend)
        proxy = self.inspect(self.proxy)
        self.proxy_id = proxy['Id']
        # Recovery must also work when the named current frontend has crashed.
        # Only the candidate is required to be healthy before traffic switches.
        if not re.fullmatch(r'sha256:[0-9a-f]{64}', self.target_image or ''):
            raise RuntimeError('Candidate needs an immutable image identity')
        mounts = {m['Destination']:m for m in proxy['Mounts']}
        if (self.template.resolve() != self.template or not self.template.is_file()
                or mounts.get(BOUND, {}).get('Source') != str(self.template)
                or mounts[BOUND].get('RW') or ACTIVE in mounts):
            raise RuntimeError('Unexpected proxy template or active configuration mount')
        self.original_template, self.original_active = self.template.read_bytes(), self.read_active()
        self.expected_template, self.expected_active = self.original_template, self.original_active
        self.bridge_template = redirect_frontend(self.original_template, self.name)
        self.bridge_active = redirect_frontend(self.original_active, self.name)
        # Require enough headroom for one additional frontend plus host reserve.
        memory = dict(line.split(':', 1) for line in Path('/proc/meminfo').read_text().splitlines())
        memory_limit = row['HostConfig'].get('Memory', 0)
        if memory_limit <= 0 or int(memory['MemAvailable'].split()[0]) * 1024 < memory_limit + 256 * 1024**2:
            raise RuntimeError('Insufficient memory for a healthy serving copy')
        source = (row['Config'].get('Labels') or {}).get('org.opencontainers.image.revision', 'unknown')
        if source != 'unknown' and not re.fullmatch(r'[0-9a-f]{40}', source):
            raise RuntimeError('Current frontend source identity is invalid')
        self.previous_env = {**self.env, 'DEPLOY_COMMIT': source}
        override = self.directory / 'serving-copy.override.json'
        override.write_text(json.dumps({'services':{'frontend':{'image':row['Image'], 'pull_policy':'never'}}}))
        self.previous_compose = [*self.compose, '-f', str(override)]
        (self.directory/'template-before').write_bytes(self.original_template)
        (self.directory/'active-before').write_bytes(self.original_active)
        (self.directory/'before.json').write_text(json.dumps({'frontendId':row['Id'], 'image':row['Image'],
                                                               'source':source, 'proxyId':self.proxy_id}))
        self.run(self.compose + ['run', '-d', '--no-deps', '--pull', 'never', '--name', self.name, 'frontend'], env=self.env)
        self.created = True
        copy = self.inspect(self.name)
        self.copy_id = copy['Id']
        if copy['Image'] != self.target_image:
            raise RuntimeError('Serving copy image does not match the selected candidate')
        self.run(['docker', 'update', '--restart=always', self.name])
        self.healthy(self.name)
        self.verify(self.name, False)
        self.note('copy-ready')

    def remove_copy(self):
        if self.created:
            if self.inspect(self.name)['Id'] != self.copy_id:
                raise RuntimeError('Serving copy identity changed; cleanup refused')
            self.run(['docker', 'rm', '-f', self.name])
            self.created = False
            self.note('copy-removed')

    def replacement_headroom(self):
        # Candidate startup can consume much more memory than the old image.
        # Recheck while the old service is still untouched, reserving a whole
        # named frontend plus host headroom without crediting the old process.
        limit = self.inspect(self.name)['HostConfig'].get('Memory', 0)
        memory = dict(line.split(':', 1) for line in Path('/proc/meminfo').read_text().splitlines())
        if limit <= 0 or int(memory['MemAvailable'].split()[0]) * 1024 < limit + 256 * 1024**2:
            raise RuntimeError('Insufficient memory for frontend replacement')

    def replace(self):
        try:
            self.prepare()
            self.replacement_headroom()
            # Existing requests finish on the old process before Compose is
            # allowed to stop it. New requests already use the healthy copy.
            self.activate(self.bridge_template, self.bridge_active, 'copy-serving')
            self.canonical_attempted = True
            self.run(self.compose + ['up', '-d', '--no-deps', '--no-build', '--pull', 'never', 'frontend'], env=self.env)
            self.healthy(self.frontend)
            self.verify(self.frontend, False)
            self.note('new-frontend-ready')
            self.activate(self.original_template, self.original_active, 'canonical-serving')
            self.remove_copy()
        except Exception as error:
            # Failed candidates never strand the proxy on the stopped named
            # service. If restoration itself fails, retain the serving copy
            # and recovery evidence; the outer release hold blocks replay.
            if self.touched:
                if self.canonical_attempted:
                    # A late failure may occur after some workers have already
                    # switched to the new named service. Move them back before
                    # recreating that service during recovery.
                    self.activate(self.bridge_template, self.bridge_active, 'copy-serving-recovery')
                    self.run(self.previous_compose + ['up', '-d', '--no-deps', '--no-build', '--pull', 'never', 'frontend'], env=self.previous_env)
                    self.healthy(self.frontend)
                    self.verify(self.frontend, True)
                self.activate(self.original_template, self.original_active, 'previous-restored')
            self.remove_copy()
            raise HandoffRestored('Handoff stopped; previous frontend preserved or restored') from error


def replace(live, audit, compose, env, command, healthy, verify, *, target_image):
    Handoff(live, audit, compose, env, command, healthy, verify, target_image=target_image).replace()
