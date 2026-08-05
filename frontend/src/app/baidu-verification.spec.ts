import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const verificationFile = path.join(
  process.cwd(),
  'public',
  'baidu_verify_codeva-kZSngY8RuT.html',
);

describe('Baidu site verification file', () => {
  it('keeps the verified public-root challenge available for future deployments', async () => {
    const content = await readFile(verificationFile, 'utf8');

    expect(content.trim()).toBe('00b92f411747124cd5f1a7aa1f0044d5');
  });
});
