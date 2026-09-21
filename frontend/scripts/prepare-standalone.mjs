import { cpSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Next's file tracing may include some or all public assets. Merge the complete
// source directories before Docker copies standalone, so untraced assets remain
// available without creating a second runtime image layer containing the same files.
export function prepareStandalone(frontendRoot) {
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
    cpSync(path.join(frontendRoot, relative), path.join(runtime, relative), {
      recursive: true,
      force: true,
    });
  }
  return runtime;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareStandalone(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
}
