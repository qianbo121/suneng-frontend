#!/usr/bin/env python3
"""Two tiny real images using the production runner, without building the site."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import uuid
import tarfile
import io

ROOT = Path(__file__).resolve().parents[1]


def run(*args):
    return subprocess.check_output(args, text=True, stderr=subprocess.STDOUT, timeout=180)


def main():
    # A missing Docker runtime fails this CI check; local callers may choose not
    # to invoke it but must report that real image reuse remains unverified.
    dockerfile = (ROOT / 'frontend/Dockerfile').read_text()
    runner = dockerfile[dockerfile.index('FROM node:22.23.1-alpine AS runner'):]
    prepare = (ROOT / 'frontend/scripts/prepare-standalone.mjs').as_uri()
    tags, layers = [], []
    try:
        for version in [1, 2]:
            with tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                frontend = root / 'frontend'
                for name in ['public/images', '.next/static', '.next/standalone/frontend/public']:
                    (frontend / name).mkdir(parents=True)
                (frontend / 'public/images/asset.txt').write_text('identical image bytes')
                os.utime(frontend / 'public/images/asset.txt', (version * 10000,) * 2)
                (frontend / '.next/standalone/frontend/public/asset.txt').write_text('traced duplicate')
                (frontend / '.next/standalone/frontend/server.js').write_text('console.log("fixture")')
                (frontend / '.next/static/page.js').write_text(f'page version {version}')
                run('node', '--input-type=module', '-e',
                    f'import {{prepareStandalone}} from {json.dumps(prepare)}; '
                    f'prepareStandalone({json.dumps(str(frontend))}, {{separatePublic:true}});')
                epoch = next(line for line in dockerfile.splitlines() if line.startswith('ARG SOURCE_DATE_EPOCH='))
                (root / 'Dockerfile').write_text(epoch + '\n'
                    'FROM node:22.23.1-alpine AS builder\nCOPY frontend /app/frontend\n' + runner)
                tag = 'suneng-layer-fixture:' + uuid.uuid4().hex
                tags.append(tag)
                run('docker', 'build', '--no-cache', '-q', '-t', tag, str(root))
                layers.append(json.loads(run('docker', 'image', 'inspect', tag))[0]['RootFS']['Layers'])
                run('docker', 'run', '--rm', '--network=none', tag, 'node', '-e',
                    'const fs=require("fs"),assert=require("assert");'
                    'assert.equal(fs.readFileSync("frontend/public/images/asset.txt","utf8"),"identical image bytes");'
                    f'assert.equal(fs.readFileSync("frontend/.next/static/page.js","utf8"),"page version {version}");'
                    'assert(!fs.existsSync("frontend/public/asset.txt"));')
        if layers[0][-2] != layers[1][-2]:
            # Keep exact file metadata in the CI failure output; no site data is
            # included in these tiny, generated fixture images.
            for tag in tags:
                with tempfile.TemporaryDirectory() as directory:
                    archive = Path(directory) / 'fixture.tar'
                    run('docker', 'save', '-o', str(archive), tag)
                    with tarfile.open(archive) as image:
                        manifest = json.load(image.extractfile('manifest.json'))[0]
                        payload = image.extractfile(manifest['Layers'][-2]).read()
                        with tarfile.open(fileobj=io.BytesIO(payload)) as layer:
                            print(json.dumps([{'name': f.name, 'size': f.size, 'mtime': f.mtime,
                                               'mode': f.mode, 'headers': f.pax_headers} for f in layer]))
            raise AssertionError('Unchanged public layer was not reused')
        assert layers[0][-1] != layers[1][-1], 'Changed application layer did not change'
        print(json.dumps({'passed': True, 'publicLayerReused': True, 'assetsReadable': True}))
    finally:
        for tag in tags:
            subprocess.run(['docker', 'image', 'rm', tag], stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL, timeout=60)


if __name__ == '__main__':
    main()
