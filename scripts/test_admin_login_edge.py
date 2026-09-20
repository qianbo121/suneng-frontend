#!/usr/bin/env python3
"""Exercise the production Nginx template locally; no network or real logins.

Requires a locally available image containing nginx and curl. It will never pull
an image. Run with --docker /path/to/docker --image <local-nginx-image>.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess
import tempfile
import time
import uuid


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--docker', default='docker')
    parser.add_argument('--image', required=True)
    parser.add_argument('--config', type=Path, default=Path(__file__).resolve().parents[1] / 'nginx.prod.conf.template')
    args = parser.parse_args()
    name = 'suneng-login-edge-test-' + uuid.uuid4().hex[:10]
    results = []

    def docker(*parts, check=True):
        result = subprocess.run([args.docker, *parts], capture_output=True, text=True, timeout=30)
        if check and result.returncode != 0:
            raise RuntimeError(result.stderr or result.stdout)
        return result

    with tempfile.TemporaryDirectory(prefix='suneng-login-edge-') as directory:
        fixture = Path(directory)
        # Keep the real virtual hosts, locations, maps and limits. Only replace
        # upstream addresses/certificates with inert, local test fixtures.
        config = args.config.read_text().replace('${DOMAIN}', 'www.audit.test').replace('${ADMIN_DOMAIN}', 'admin.audit.test').replace('$DOMAIN', 'www.audit.test')
        config = re.sub(r'(server\s+)(frontend:3000|backend:3001|admin:80|chengwen-web:8080|shuju:18321)(\s+resolve)?;', r'\g<1>127.0.0.1:8081;', config)
        config = config.replace('http://furnace-api:18080', 'http://127.0.0.1:8081')
        config = config.replace('http://furnace-web:80', 'http://127.0.0.1:8081')
        config = config.replace('worker_processes auto;', 'worker_processes 1;')
        end = config.rfind('}')
        config = config[:end] + '\n  server { listen 127.0.0.1:8081; location / { return 204; } }\n' + config[end:]
        (fixture / 'nginx.conf').write_text(config)
        subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
                        '-subj', '/CN=admin.audit.test', '-keyout', str(fixture / 'privkey.pem'),
                        '-out', str(fixture / 'fullchain.pem')], check=True, capture_output=True, timeout=30)
        mounts = ['--mount', f'type=bind,src={fixture / "nginx.conf"},dst=/etc/nginx/nginx.conf,readonly',
                  '--mount', f'type=bind,src={fixture},dst=/etc/nginx/certs,readonly']
        docker('run', '--rm', '--pull=never', '--network=none', *mounts, '--entrypoint', 'nginx', args.image, '-t')
        try:
            docker('run', '-d', '--name', name, '--pull=never', '--network=none', *mounts,
                   '--entrypoint', 'nginx', args.image, '-g', 'daemon off;')
            for _ in range(30):
                ready = docker('exec', name, 'curl', '--silent', '--max-time', '1', 'http://127.0.0.1:8081/', check=False)
                if ready.returncode == 0:
                    break
                time.sleep(0.1)
            else:
                raise RuntimeError('Local stub did not start')

            def request(path, expected, host='admin.audit.test'):
                response = docker('exec', name, 'curl', '--silent', '--insecure', '--max-time', '3',
                                  '--resolve', f'{host}:443:127.0.0.1', '--output', '/dev/null',
                                  '--write-out', '%{http_code}', '--request', 'POST', f'https://{host}{path}')
                actual = int(response.stdout)
                results.append({'host': host, 'path': path, 'expected': expected, 'actual': actual})
                if actual != expected:
                    raise AssertionError(f'{host}{path}: expected {expected}, got {actual}')

            # Nginx allows one request plus the configured burst of three.
            # Spend all four slots using different spellings of the same route.
            for path in ['/api/admin/auth/login', '/api/admin/auth/login/',
                         '/api/admin/auth/LOGIN', '/api/admin/Auth/LoGiN/']:
                request(path, 204)
            # Every spelling must now share the same exhausted bucket.
            for path in ['/api/admin/auth/login', '/api/admin/auth/login/',
                         '/api/admin/auth/LOGIN', '/api/admin/Auth/LoGiN/',
                         '/api/admin/auth/login?variant=1', '/api/admin/auth/%6cogin']:
                request(path, 503)
            # The empty map key must exempt other admin operations even when
            # login is limited, with the retired/forbidden routes kept intact.
            for _ in range(8):
                request('/api/admin/auth/me', 204)
                request('/api/admin/custom-requirements/search', 204)
            request('/api/admin/custom-requirements', 410)
            request('/api/svc/test', 404)
            request('/api/admin/auth/login', 403, host='www.audit.test')
        finally:
            docker('rm', '-f', name, check=False)
    print(json.dumps({'checks': len(results), 'results': results}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
