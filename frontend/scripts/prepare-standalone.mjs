import { chmodSync, cpSync, existsSync, lstatSync, readFileSync, readdirSync, rmSync, statSync, utimesSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Next's file tracing may include some or all public assets. By default merge
// the complete sources for local standalone serving. Docker uses separatePublic
// to exclude traced duplicates and copy public into its own reusable layer.
function normalizePublicAssets(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) normalizePublicAssets(file);
    else if (entry.isFile()) {
      chmodSync(file, 0o644);
      // Static servers derive ETags from size + mtime. A constant mtime would
      // serve stale same-size replacements. Use content-derived build metadata
      // (40 bits of milliseconds, always before 2005), never publication dates.
      const stamp = parseInt(createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10), 16) / 1000;
      utimesSync(file, stamp, stamp);
    } else throw new Error(`Unsupported public asset: ${file}`);
  }
  chmodSync(directory, 0o755);
  utimesSync(directory, 0, 0);
}

export function prepareStandalone(frontendRoot, { separatePublic = false } = {}) {
  const runtime = path.join(frontendRoot, '.next/standalone/frontend');
  const sources = ['public', '.next/static'];
  if (!existsSync(path.join(runtime, 'server.js'))) {
    throw new Error('Build the frontend standalone server before preparing its assets');
  }
  for (const relative of sources) {
    if (!statSync(path.join(frontendRoot, relative)).isDirectory()) {
      throw new Error(`Missing build asset directory: ${relative}`);
    }
  }
  for (const relative of sources) {
    if (relative === 'public' && separatePublic) {
      // Docker copies the original public directory into an independent, reusable
      // layer. Remove traced copies first so the application layer has no duplicates.
      rmSync(path.join(runtime, 'public'), { recursive: true, force: true });
      const publicRoot = path.join(frontendRoot, 'public');
      if (lstatSync(publicRoot).isSymbolicLink()) throw new Error('Public directory must not be a symlink');
      // Fresh checkouts have different mtimes; preserve bytes but canonicalize
      // metadata so separate builders can produce the same public layer.
      normalizePublicAssets(publicRoot);
      continue;
    }
    cpSync(path.join(frontendRoot, relative), path.join(runtime, relative), {
      recursive: true,
      force: true,
    });
  }
  return runtime;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareStandalone(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), {
    separatePublic: process.argv.includes('--separate-public'),
  });
}
