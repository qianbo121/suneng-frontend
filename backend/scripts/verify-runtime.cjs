// Check the deployable package without starting the server or connecting to a DB.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

async function verify(root, repairSelfLink = false) {
  root = fs.realpathSync(root);
  const load = createRequire(path.join(root, 'package.json'));
  const manifest = load('./package.json');
  // pnpm 9 can leave this workspace alias pointing back to the build checkout.
  // It is the deployed package itself, so bind it to its portable location.
  const selfLink = path.join(root, 'node_modules/.pnpm/node_modules', manifest.name);
  if (repairSelfLink && fs.existsSync(path.dirname(selfLink))) {
    const link = fs.lstatSync(selfLink, { throwIfNoEntry: false });
    if (link?.isSymbolicLink()) {
      fs.unlinkSync(selfLink);
      fs.symlinkSync(path.relative(path.dirname(selfLink), root), selfLink);
    }
  }
  function walk(directory, visitor) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      visitor(file, entry);
      if (entry.isDirectory()) walk(file, visitor);
    }
  }
  walk(root, (file, entry) => {
    if (!entry.isSymbolicLink()) return;
    const relative = path.relative(root, fs.realpathSync(file));
    assert(relative !== '..' && !relative.startsWith('../') && !path.isAbsolute(relative),
      `Runtime dependency escapes package: ${path.relative(root, file)}`);
  });
  for (const name of Object.keys(manifest.dependencies)) {
    // Prisma is a CLI; its package main is a types entry, not an importable module.
    if (name !== 'prisma') load.resolve(name);
  }
  for (const name of ['jest', 'eslint', '@nestjs/cli', 'next']) {
    assert(!fs.existsSync(path.join(root, 'node_modules', name)), `Development dependency: ${name}`);
  }
  for (const name of ['dist/src/main.js', 'prisma/schema.prisma', 'prisma/migrations',
    'node_modules/prisma/build/index.js']) assert(fs.existsSync(path.join(root, name)), `Missing ${name}`);
  // Resolve imports from each compiled file, not from the build workspace.
  walk(path.join(root, 'dist'), (file, entry) => {
    if (!entry.isFile() || !file.endsWith('.js')) return;
    const local = createRequire(file);
    for (const [, name] of fs.readFileSync(file, 'utf8').matchAll(/\brequire\(["']([^"']+)["']\)/g)) {
      local.resolve(name);
    }
  });
  const { PrismaClient } = load('@prisma/client');
  const client = new PrismaClient();
  await client.$disconnect(); // Does not open a database connection.
  const image = await load('sharp')({ create: { width: 1, height: 1, channels: 3, background: '#fff' } })
    .png().toBuffer();
  assert(image.length > 0);
  const clean = load('isomorphic-dompurify').sanitize('<script>bad()</script><p>ok</p>');
  assert.equal(clean, '<p>ok</p>');
  console.log(JSON.stringify({ passed: true, dependencies: Object.keys(manifest.dependencies).length,
    portable: true, prisma: true, nativeImage: true, sanitizer: true, databaseConnected: false }));
}

verify(process.argv[2] || path.join(__dirname, '..'), process.argv.includes('--repair-self-link'))
  .catch(error => { console.error(error.message); process.exitCode = 1; });
