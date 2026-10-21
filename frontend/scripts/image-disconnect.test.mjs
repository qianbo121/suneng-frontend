import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Socket } from 'node:net';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { fetchInternalImage, optimizeImage } = require('next/dist/server/image-optimizer');
const { serveStatic } = require('next/dist/server/serve-static');
const { Batcher } = require('next/dist/lib/batcher');
const href = '/images/products/roller-hearth-furnace/detail/01-main-scene.png';
const filename = fileURLToPath(new URL(`../public${href}`, import.meta.url));
const image = await readFile(filename);

async function bounded(promise) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Image request stayed pending')), 1500);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function fetchImage(socket, handler = (req, res) => serveStatic(req, res, filename), limit = image.length + 1) {
  return fetchInternalImage(href, { method: 'GET', socket }, {}, limit, handler);
}

test('ordinary local images retain exact bytes and their content type', async t => {
  const socket = new Socket();
  t.after(() => socket.destroy());
  const result = await bounded(fetchImage(socket));
  assert.deepEqual(result.buffer, image);
  assert.equal(result.contentType, 'image/png');
  assert.ok(result.etag);
});

test('a visitor who has already disconnected cannot strand a cold image fetch', async () => {
  const socket = new Socket();
  socket.destroy();
  assert.equal(socket.writable, false);
  const result = await bounded(fetchImage(socket));
  assert.deepEqual(result.buffer, image);
});

test('disconnecting during a cold fetch does not strand coalesced or later callers', async t => {
  const socket = new Socket();
  t.after(() => socket.destroy());
  const batcher = Batcher.create();
  let enter;
  let release;
  const entered = new Promise(resolve => { enter = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  let calls = 0;
  const first = batcher.batch('same-image', () => fetchImage(socket, async (req, res) => {
    calls++;
    enter();
    await gate;
    await serveStatic(req, res, filename);
  }));
  await entered;
  const second = batcher.batch('same-image', () => {
    throw new Error('Concurrent image requests must remain coalesced');
  });
  socket.destroy();
  release();
  const results = await bounded(Promise.all([first, second]));
  for (const result of results) assert.deepEqual(result.buffer, image);
  assert.equal(calls, 1);
  assert.equal(await bounded(batcher.batch('same-image', () => 'fresh')), 'fresh');
});

test('internal routing retains the requesting socket and does not forward its headers', async t => {
  const socket = new Socket();
  t.after(() => socket.destroy());
  await bounded(fetchImage(socket, async (req, res) => {
    assert.equal(req.socket, socket);
    assert.equal(req.method, 'GET');
    assert.equal(req.url, href);
    assert.deepEqual(req.headers, {});
    res.setHeader('Content-Type', 'image/png');
    res.end(image);
  }));
});

test('the existing response-size limit still rejects oversized image bodies', async t => {
  const socket = new Socket();
  t.after(() => socket.destroy());
  await assert.rejects(bounded(fetchImage(socket, async (_req, res) => {
    res.end(image);
  }, 8)), error => error.statusCode === 413);
});

test('empty internal images remain rejected', async t => {
  const socket = new Socket();
  t.after(() => socket.destroy());
  await assert.rejects(bounded(fetchImage(socket, async (_req, res) => {
    res.end();
  })), error => error.statusCode === 400);
});

test('failed image reads reject and release the coalescing key for a retry', async t => {
  const socket = new Socket();
  t.after(() => socket.destroy());
  const batcher = Batcher.create();
  await assert.rejects(bounded(batcher.batch('failed-image', () => fetchImage(socket, async () => {
    throw new Error('Simulated local image read failure');
  }))), error => error.statusCode === 500);
  const result = await bounded(batcher.batch('failed-image', () => fetchImage(socket)));
  assert.deepEqual(result.buffer, image);
});

test('a recovered local image can still produce the mobile AVIF variant', async () => {
  const socket = new Socket();
  socket.destroy();
  const fetched = await bounded(fetchImage(socket));
  const converted = await optimizeImage({ buffer: fetched.buffer, contentType: 'image/avif', quality: 75, width: 414, timeoutInSeconds: 8 });
  assert.ok(converted.length > 0);
  assert.equal(converted.subarray(4, 8).toString(), 'ftyp');
});
