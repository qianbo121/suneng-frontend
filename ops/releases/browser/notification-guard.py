#!/usr/bin/env python3
"""Run release browsers behind a destination-specific, loopback-only refusal service."""
import datetime
import fcntl
import http.server
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse
import urllib.request

HOST = 'zhanzhang.toutiao.com'
KEY = 'SUNENG_QA_NOTIFICATION_GUARD'


def read_json(path):
    return json.loads(Path(path).read_text())


def flags(config):
    return ['--proxy-pac-url=' + config['local'] + '/rules.pac',
            '--host-resolver-rules=MAP ' + HOST + ' ~NOTFOUND', '--disable-quic']


def visual_flags(config):
    # Playwright's original headless shell does not run proxy auto-config.
    # Resolve only the guarded destination and its two canaries to this sink.
    endpoint = urllib.parse.urlsplit(config['local']).netloc
    names = (HOST, '*.' + HOST, config['probeHost'], config['denyProbe'])
    rules = ', '.join('MAP ' + name + ' ' + endpoint for name in names)
    return ['--no-proxy-server', '--host-resolver-rules=' + rules, '--disable-quic']


def health(config):
    # The control endpoint is always local and must never use a system proxy.
    direct = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with direct.open(config['local'] + '/health', timeout=3) as response:
        if response.read().decode() != config['nonce']:
            raise RuntimeError('release notification guard identity changed')


class Sink(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Request targets can contain publisher credentials.

    def reply(self, status, body='', mime='text/plain'):
        data = body.encode()
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def deny(self, host):
        if host == HOST or host.endswith('.' + HOST) or host == self.server.config['denyProbe']:
            self.server.record('refused-before-forwarding', host)
        self.reply(403, 'release-denied-' + self.server.config['nonce'])

    def do_CONNECT(self):
        self.deny(self.path.split(':', 1)[0].lower().rstrip('.'))

    def do_GET(self):
        config = self.server.config
        target = urllib.parse.urlsplit(self.path)
        # A proxy request has an absolute target. The shell connects directly
        # to loopback and retains the original hostname in its Host header.
        host = (target.hostname or self.headers.get('Host', '').split(':', 1)[0]).lower().rstrip('.')
        if host == config['probeHost']:
            if target.path == '/probe':
                self.reply(200, config['nonce'])
            else:
                self.deny(host)
        elif host == config['denyProbe'] or host == HOST or host.endswith('.' + HOST):
            self.deny(host)
        elif self.path == '/health':
            self.reply(200, config['nonce'])
        elif self.path == '/rules.pac':
            port = self.server.server_port
            body = ('function FindProxyForURL(url, host) {'
                    'host=host.toLowerCase().replace(/\\.$/,"");'
                    'if(host==="' + HOST + '" || dnsDomainIs(host,".' + HOST + '") || '
                    'host==="' + config['denyProbe'] + '" || host==="' + config['probeHost'] + '") return "PROXY 127.0.0.1:' + str(port) + '";'
                    'return "DIRECT"; }')
            self.reply(200, body, 'application/x-ns-proxy-autoconfig')
        else:
            self.deny((target.hostname or '').lower().rstrip('.'))


def browser_step(config, argv):
    if not config['binary'] or '--session' not in argv:
        raise RuntimeError('an explicit release browser session is required')
    session = argv[argv.index('--session') + 1]
    if not re.fullmatch(r'[\w-]{1,110}', session):
        raise RuntimeError('unsafe release session name')
    if any(arg.split('=')[0] in ('--args','--cdp','--proxy','--proxy-bypass','--profile','--auto-connect') for arg in argv):
        raise RuntimeError('conflicting release browser launch option')
    # A fresh physical session prevents an unrelated existing browser from inheriting a new policy.
    physical = 'qa-' + config['nonce'][:8] + '-' + session
    argv = list(argv)
    argv[argv.index('--session') + 1] = physical
    env = dict(os.environ, AGENT_BROWSER_ARGS='\n'.join(flags(config)))
    for key in ('AGENT_BROWSER_PROXY', 'AGENT_BROWSER_PROXY_BYPASS', 'AGENT_BROWSER_CDP',
                'AGENT_BROWSER_AUTO_CONNECT', 'AGENT_BROWSER_PROFILE', 'AGENT_BROWSER_SESSION_NAME',
                'ALL_PROXY', 'HTTP_PROXY', 'HTTPS_PROXY', 'all_proxy','http_proxy','https_proxy'):
        env.pop(key, None)
    def invoke(*parts):
        value = subprocess.run([config['binary'], '--json', '--session', physical, *parts],
                               env=env, capture_output=True, text=True, timeout=30, check=True)
        result = json.loads(value.stdout)
        if not result.get('success'):
            raise RuntimeError('release browser self-check failed')
        return result.get('data')
    for index, arg in enumerate(argv):
        if arg == 'network' and argv[index+1:index+2] in (['unroute'], ['route']):
            raise RuntimeError('release notification routes cannot be changed by a collector')
    state = Path(config['localDir']) / physical
    with state.with_suffix('.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        health(config)
        identity = invoke('get','cdp-url')
        if not identity:
            raise RuntimeError('missing release browser identity')
        if state.exists():
            if read_json(state) != identity:
                raise RuntimeError('release browser replaced; stop before navigation')
        else:
            invoke('open', 'http://' + config['probeHost'] + '/probe')
            observed = invoke('eval','document.body.innerText.trim()')
            if observed.get('result') != config['nonce']:
                raise RuntimeError('browser could not prove the notification block; stopped before site navigation')
            # Install the request-level rule after proving the browser-wide fallback,
            # and before any business page, retry, or click is permitted.
            invoke('open', 'http://' + config['denyProbe'] + '/deny')
            denied = invoke('eval', 'document.body.innerText.trim()')
            if denied.get('result') != 'release-denied-' + config['nonce']:
                raise RuntimeError('browser did not reach the local refusal service')
            invoke('network','route','**://zhanzhang.toutiao.com/**','--abort')
            state.write_text(json.dumps(identity))
        with subprocess.Popen([config['binary'], *argv], env=env) as active:
            try:
                while active.poll() is None:
                    health(config)
                    time.sleep(0.2)
                subprocess_status = active.returncode
                health(config)
            except BaseException:
                active.terminate()
                subprocess.run([config['binary'],'--session',physical,'close'],
                               env=env, capture_output=True, timeout=10)
                raise
        if argv[-1:] == ['close']:
            state.unlink(missing_ok=True)
        return subprocess_status


def run(evidence, command):
    evidence = Path(evidence).absolute()
    binary = shutil.which('agent-browser')
    if os.environ.get(KEY):
        health(read_json(os.environ[KEY]))
        return subprocess.run(command).returncode
    evidence.parent.mkdir(parents=True,exist_ok=True)
    with evidence.open('x', encoding='utf8') as record, tempfile.TemporaryDirectory(prefix='suneng-news-qa-') as private:
        lock = threading.Lock()
        def event(action, hostname):
            with lock:
                record.write(json.dumps(dict(time=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                                             action=action, domain=hostname))+'\n')
                record.flush()
        with http.server.ThreadingHTTPServer(('127.0.0.1', 0), Sink) as server:
            nonce = secrets.token_hex(16)
            config = dict(nonce=nonce, probeHost='release-qa-'+nonce+'.invalid', denyProbe='release-deny-'+nonce+'.invalid',
                          localDir=private, local='http://127.0.0.1:'+str(server.server_port),
                          binary=os.path.realpath(binary) if binary else None)
            control = Path(private)/'control.json'
            config['launchArgs'] = flags(config)
            config['visualLaunchArgs'] = visual_flags(config)
            control.write_text(json.dumps(config))
            wrapper = Path(private)/'agent-browser'
            wrapper.symlink_to(Path(__file__).resolve())
            server.config, server.record = config, event
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                return subprocess.run(command, env=dict(os.environ, **{KEY:str(control)},
                                                      PATH=private+os.pathsep+os.environ['PATH'])).returncode
            finally:
                server.shutdown()
                thread.join()
                # A finished or interrupted batch must close only its own dedicated sessions.
                if binary:
                    for entry in Path(private).glob('qa-*'):
                        if entry.is_file() and not entry.suffix:
                            subprocess.run([binary, '--session', entry.name, 'close'],
                                           capture_output=True, timeout=15)


if __name__ == '__main__':
    if Path(sys.argv[0]).name == 'agent-browser':
        sys.exit(browser_step(read_json(os.environ[KEY]),sys.argv[1:]))
    if len(sys.argv)<5 or sys.argv[1]!='--evidence' or sys.argv[3]!='--':
        sys.exit('notification-guard.py --evidence NEW.jsonl -- COMMAND ...')
    sys.exit(run(sys.argv[2],sys.argv[4:]))
