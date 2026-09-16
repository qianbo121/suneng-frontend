import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import reviewedArticles from './news-reviewed-copy.json';

const readContent = (path: string) => fs.readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

describe('migration content at its maintained source', () => {
  it('preserves the original case fact boundaries after moving prose into Markdown', () => {
    const jining = readContent('../../content/cases/jining-support-roller.md');
    const henan = readContent('../../content/cases/henan-annealing-solution.md');
    for (const fact of ['最大设计处理能力', '方案折算约 30 件/h', '不是实际验收产能']) expect(jining).toContain(fact);
    for (const fact of ['带宽 480–750 mm、厚度 1.6–4.0 mm', '1300℃，不是带钢目标温度', '设计 TV 约 190 m·mm/min']) expect(henan).toContain(fact);
  });

  it('keeps all four authority destinations in the maintained repair-or-replace article', () => {
    const article = reviewedArticles['21'];
    for (const slug of ['rechuli-lu-luchen-fanxin', 'rechuli-lu-dian-gai-ran-yure-huishou', 'rechuli-lu-kongzhi-xitong-shengji', 'rechuli-lu-tingchan-chongqi-banqian-fuchan']) {
      expect(article.contentZh).toContain(`href="/zh/solutions/${slug}"`);
    }
  });
});
