"""Read-only checks for stale public HTML after an immutable frontend switch."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import tempfile


class EntryScripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = set()

    def handle_starttag(self, tag, attrs):
        src = dict(attrs).get('src', '')
        if tag == 'script' and src.startswith('/_next/static/') and src.endswith('.js'):
            self.assets.add(src)


def read_page(path, container=None):
    # No cache-busting query or request headers: test the URL a customer opens.
    if path not in ('/zh', '/en'):
        raise ValueError('Only ordinary localized homepages are accepted')
    if container:
        script = (
            'fetch(' + json.dumps('http://127.0.0.1:3000' + path) +
            ',{redirect:"manual",signal:AbortSignal.timeout(20000)})'
            '.then(async r=>console.log(JSON.stringify({status:r.status,'
            'cacheControl:r.headers.get("cache-control")||"",'
            'contentType:r.headers.get("content-type")||"",body:await r.text()})))'
            '.catch(()=>process.exit(1))'
        )
        result = subprocess.run(['docker', 'exec', container, 'node', '-e', script],
                                text=True, capture_output=True, timeout=25)
        if result.returncode:
            raise RuntimeError('Candidate HTML request failed: ' + path)
        return json.loads(result.stdout)
    with tempfile.TemporaryDirectory(prefix='suneng-html-') as directory:
        headers, body = Path(directory) / 'headers', Path(directory) / 'body'
        result = subprocess.run([
            'curl', '--silent', '--show-error', '--max-time', '25',
            '-D', str(headers), '-o', str(body), '-w', '%{http_code}',
            'https://www.jssngyl.cn' + path,
        ], text=True, capture_output=True, timeout=30)
        if result.returncode:
            raise RuntimeError('Public HTML request failed: ' + path)
        raw = headers.read_text()
        def header(name):
            matches = re.findall(r'^' + name + r':\s*([^\r\n]*)', raw, re.I | re.M)
            return ', '.join(matches)
        return {'status': int(result.stdout), 'cacheControl': header('cache-control'),
                'contentType': header('content-type'), 'body': body.read_text()}


def frontend_html_probe(container=None, expected=None, require_no_store=True):
    checks = {}
    for path in ('/zh', '/en'):
        page = read_page(path, container)
        if page['status'] != 200 or 'text/html' not in page['contentType'].lower():
            raise RuntimeError('Homepage response failed: ' + path)
        cache = page['cacheControl'].lower()
        if require_no_store and 'no-store' not in {part.strip() for part in cache.split(',')}:
            raise RuntimeError('Homepage must not be cached: ' + path)
        parser = EntryScripts()
        parser.feed(page['body'])
        assets = sorted(parser.assets)
        if not assets:
            raise RuntimeError('Homepage entry scripts are missing: ' + path)
        if expected is not None and assets != expected[path]['scripts']:
            raise RuntimeError('Public homepage is not the checked candidate: ' + path)
        checks[path] = {'scripts': assets, 'cacheControl': page['cacheControl']}
    return checks
