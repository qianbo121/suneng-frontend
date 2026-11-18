import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
// Next already ships Sharp for image encoding, including the Linux container build.
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const variants = require('../src/lib/infographic-image-variants.json');
const publicInfographics = fileURLToPath(new URL('../public/images/infographics/', import.meta.url));

export async function optimizeInfographicImages(directory = publicInfographics) {
  const files = await readdir(directory, { withFileTypes: true });
  const originals = files.filter((file) => file.isFile() && file.name.endsWith('.png'));

  for (const { name } of originals) {
    const original = await readFile(join(directory, name));
    const stem = name.slice(0, -'.png'.length);
    for (const { width, quality } of variants) {
      const target = join(directory, `${stem}-${width}w.webp`);
      const compressed = await sharp(original)
        .resize({ width })
        .webp({ quality, smartSubsample: true })
        .toBuffer();
      const existing = await readFile(target).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
      if (existing?.equals(compressed)) continue;

      const pending = `${target}.${randomUUID()}.tmp`;
      try {
        await writeFile(pending, compressed, { flag: 'wx' });
        await rename(pending, target);
      } finally {
        await rm(pending, { force: true });
      }
    }
  }

  return originals.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = await optimizeInfographicImages();
  console.log(`Prepared ${count} infographic images for responsive display.`);
}
