const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = '/Users/qianbo/Desktop/官网code/设计稿/关于我们/组织架构切图';
const outputDir = path.join(process.cwd(), 'public/images/about/organization-icons');

const icons = [
  ['ChatGPT Image 2026年4月27日 18_38_03 (1).png', 'stat-management.png', 'white'],
  ['ChatGPT Image 2026年4月27日 18_38_03 (2).png', 'stat-center.png', 'white'],
  ['ChatGPT Image 2026年4月27日 18_38_03 (3).png', 'stat-department.png', 'white'],
  ['ChatGPT Image 2026年4月27日 18_38_04 (4).png', 'stat-goal.png', 'white'],
  ['ChatGPT Image 2026年4月27日 18_38_04 (5).png', 'org-board.png', 'red'],
  ['ChatGPT Image 2026年4月27日 18_38_04 (6).png', 'center-tech.png', 'red'],
  ['ChatGPT Image 2026年4月27日 18_38_05 (7).png', 'center-production.png', 'red'],
  ['ChatGPT Image 2026年4月27日 18_38_05 (8).png', 'center-quality.png', 'red'],
  ['ChatGPT Image 2026年4月27日 18_38_05 (9).png', 'center-marketing.png', 'red'],
  ['ChatGPT Image 2026年4月27日 18_38_06 (10).png', 'center-management.png', 'red'],
];

const directions = [
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
    const points = [];
    visited[start] = 1;

    while (stack.length) {
      const index = stack.pop();
      points.push(index);
      const x = index % width;
      const y = Math.floor(index / width);

      for (const [dx, dy] of directions) {
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

async function extractIcon(sourceName, outputName, tone) {
  const { data, info } = await sharp(path.join(sourceDir, sourceName))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const mask = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    if (tone === 'red') {
      mask[i] = r > 150 && g < 110 && b < 110 ? 1 : 0;
    } else {
      mask[i] = min >= 248 && max - min <= 8 ? 1 : 0;
    }
  }

  const minArea = tone === 'red' ? 500 : 1200;
  let components = findComponents(mask, width, height).filter((points) => {
    if (points.length < minArea) return false;
    if (tone === 'red') return true;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    for (const index of points) {
      const x = index % width;
      const y = Math.floor(index / width);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    return minX > 24 && minY > 24 && maxX < width - 24 && maxY < height - 24;
  });

  if (outputName === 'stat-center.png') {
    components = components.sort((a, b) => b.length - a.length).slice(0, 1);
  }
  const output = Buffer.alloc(width * height * 4);

  for (const points of components) {
    for (const index of points) {
      const sourceOffset = index * 4;
      const targetOffset = index * 4;
      if (tone === 'red') {
        output[targetOffset] = data[sourceOffset];
        output[targetOffset + 1] = data[sourceOffset + 1];
        output[targetOffset + 2] = data[sourceOffset + 2];
      } else {
        output[targetOffset] = 255;
        output[targetOffset + 1] = 255;
        output[targetOffset + 2] = 255;
      }
      output[targetOffset + 3] = 255;
    }
  }

  await sharp(output, { raw: { width, height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .png()
    .toFile(path.join(outputDir, outputName));
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  for (const icon of icons) {
    await extractIcon(...icon);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
