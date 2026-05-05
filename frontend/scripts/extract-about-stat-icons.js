const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = '/Users/qianbo/Desktop/官网code/设计稿/关于我们/公司简介切图/icon';
const outputDir = path.join(process.cwd(), 'public/images/about/profile-icons-stat-source');

const icons = [
  ['1.png', 'stat-established.png'],
  ['2.png', 'stat-capital.png'],
  ['3.png', 'stat-employees.png'],
  ['4.png', 'stat-area.png'],
];

const widthDirections = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function findComponents(mask, width, height) {
  const visited = new Uint8Array(width * height);
  const components = [];

  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || visited[start]) continue;

    const stack = [start];
    visited[start] = 1;
    const points = [];

    while (stack.length) {
      const index = stack.pop();
      points.push(index);
      const x = index % width;
      const y = Math.floor(index / width);

      for (const [dx, dy] of widthDirections) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!mask[next] || visited[next]) continue;
        visited[next] = 1;
        stack.push(next);
      }
    }

    components.push(points);
  }

  return components;
}

async function extractIcon(sourceName, outputName) {
  const sourcePath = path.join(sourceDir, sourceName);
  const outputPath = path.join(outputDir, outputName);
  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const mask = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    // Keep only the brightest source pixels; the baked checkerboard background is darker.
    if (min >= 252 && max - min <= 4) {
      mask[i] = 1;
    }
  }

  const components = findComponents(mask, width, height).filter((points) => points.length >= 3000);
  const output = Buffer.alloc(width * height * 4);

  for (const points of components) {
    for (const index of points) {
      const sourceOffset = index * 4;
      const targetOffset = index * 4;
      output[targetOffset] = 255;
      output[targetOffset + 1] = 255;
      output[targetOffset + 2] = 255;
      output[targetOffset + 3] = 255;
    }
  }

  await sharp(output, { raw: { width, height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .png()
    .toFile(outputPath);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  for (const [sourceName, outputName] of icons) {
    await extractIcon(sourceName, outputName);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
