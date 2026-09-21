import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { prepareStandalone } from './prepare-standalone.mjs';

test('complete assets survive partial tracing without nesting public or changing the server', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'standalone-assets-'));
  try {
    const runtime = path.join(root, '.next/standalone/frontend');
    for (const dir of ['public/images', 'public/videos', '.next/static/chunks', '.next/standalone/frontend/public/images']) {
      mkdirSync(path.join(root, dir), { recursive: true });
    }
    writeFileSync(path.join(runtime, 'server.js'), 'server sentinel');
    writeFileSync(path.join(runtime, 'public/images/traced.png'), 'traced old copy');
    writeFileSync(path.join(root, 'public/images/traced.png'), 'current image');
    writeFileSync(path.join(root, 'public/videos/untraced.mp4'), 'untraced video');
    writeFileSync(path.join(root, '.next/static/chunks/page.js'), 'page chunk');
    for (let run = 0; run < 2; run += 1) {
      assert.equal(prepareStandalone(root), runtime);
      assert.equal(readFileSync(path.join(runtime, 'public/images/traced.png'), 'utf8'), 'current image');
      assert.equal(readFileSync(path.join(runtime, 'public/videos/untraced.mp4'), 'utf8'), 'untraced video');
      assert.equal(readFileSync(path.join(runtime, '.next/static/chunks/page.js'), 'utf8'), 'page chunk');
      assert.equal(readFileSync(path.join(runtime, 'server.js'), 'utf8'), 'server sentinel');
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('refuses a missing standalone build before copying assets', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'standalone-missing-'));
  try {
    assert.throws(() => prepareStandalone(root), /Build the frontend/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
