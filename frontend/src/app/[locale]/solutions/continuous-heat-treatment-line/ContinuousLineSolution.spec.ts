import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Page from './page';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'zh' }),
  notFound: () => {
    throw new Error('404');
  },
  usePathname: () => '/zh/solutions/continuous-heat-treatment-line',
}));
const styles = readFileSync(
  new URL('../../../../components/engineering/EngineeringPage.module.css', import.meta.url),
  'utf8',
);
let html: string;
const text = (markup: string) => markup.replace(/<[^>]*>/g, '');
const section = (id: string) => {
  const start = html.indexOf(`id="${id}"`);
  expect(start, `missing visible section ${id}`).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf('</section>', start));
};
beforeAll(async () => {
  // Render the real page and its real shared components, excluding structured data
  // so a phrase left only in JSON cannot satisfy a visible-content requirement.
  html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale: 'zh' }) })).replace(
    /<script\b[^>]*>[\s\S]*?<\/script>/g,
    '',
  );
});

describe('continuous heat-treatment line rendered page', () => {
  it('keeps one visible title and a complete decision journey', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    for (const id of [
      'fit',
      'process',
      'selection-table',
      'experience',
      'checkpoints',
      'project-evidence',
      'faq',
      'resources',
      'inquiry',
    ])
      section(id);
    expect(text(html)).toContain('连续热处理生产线解决方案');
  });
  it('renders a semantic selection table with conditions and real equipment links', () => {
    const table = section('selection-table');
    expect(table).toContain('<thead>');
    expect(table).toContain('<tbody>');
    expect(table.match(/scope="col"/g)).toHaveLength(4);
    for (const name of ['工件／材料', '热处理需求', '可了解的生产线', '进一步确认'])
      expect(text(table)).toContain(name);
    expect(table).toContain('/zh/products/detail/copper-wire-annealing-line');
    expect(html).not.toContain('/case/copper');
  });
  it('renders eight bounded references with public sources while keeping withdrawn groups hidden', () => {
    const evidence = section('project-evidence');
    const cards = [...evidence.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(
      (match) => match[0],
    );
    expect(cards).toHaveLength(8);
    expect(text(evidence)).toContain('不代表当前设备的统一规格或实际验收结果');
    const expectedReferences = [
      {
        title: '850 mm 连续退火钝化线退火固溶段',
        facts: ['480–750 mm', '1.6–4.0 mm', '1050–1150℃'],
        source: 'href="/zh/case/henan-annealing-solution-line"',
      },
      {
        title: '托辊网带正火回火连续线',
        facts: ['2017 年', '800 mm、1000 mm', '2026 年', '1000 mm、1200 mm', '950℃、650℃'],
        source: '来源：2017 年 9 月《托辊式网带正火回火生产线技术方案》及 2026 年 5 月',
      },
      {
        title: 'RCWT 托辊网带淬火回火线',
        facts: ['2020 年 RCWT-360/220-9/6', '2026 年 RCWT-250/200-9/6', '不是工件的实际工艺温度'],
        source: '来源：2020 年 1 月及 2026 年 5 月《托辊式网带炉热处理生产线技术方案》',
      },
      {
        title: 'RCWT-75/45-9/6 可控气氛网带线',
        facts: ['400×3200 mm、400×5600 mm', '每平方米铺料 25 kg', '0.4 m×0.25 m/min×60 min/h×25 kg/㎡＝150 kg/h', '不是实际验收产能'],
        source: '来源：2026 年 5 月《可控气氛托辊网带炉生产线技术方案》',
      },
      {
        title: '网带式渗碳气氛热处理生产线',
        facts: ['9300×1000×100 mm', '300 kW 不能当作全线总功率', '均不是实际日产量'],
        source: '来源：2018 年 8 月《网带式渗碳气氛热处理生产线技术方案》',
      },
      {
        title: '热轧退火酸洗项目退火炉',
        facts: ['2021 年 850 mm 与 2024 年 1250 mm', '两份不同机组规格', '均不表示已经达到的验收结果'],
        source: '来源：2021 年 11 月 850 设备及 2024 年 4 月 1250 设备',
      },
      {
        title: '低氮燃气加热炉生产线',
        facts: ['2 台燃气加热炉', '2500×1600×800 mm', '4×250 kW＝约 1000 kW', '不是电气功率', 'NOx 以现场检测为准'],
        source: '来源：2020 年 8 月《低氮氧化物燃气加热炉生产线技术方案》',
      },
      {
        title: '不锈钢连续退火双带炉',
        facts: ['2022 年', '110 m', '25.6 m', '84.4 m', '125.4 m', '不能由长度推定实际日产量'],
        source: '来源：2022 年 8 月《不锈钢连续退火炉（双带炉）技术协议》',
      },
    ];
    for (const reference of expectedReferences) {
      const matchingCards = cards.filter((card) => {
        const heading = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1];
        return heading !== undefined && text(heading) === reference.title;
      });
      expect(matchingCards, reference.title).toHaveLength(1);
      const card = matchingCards[0];
      for (const fact of reference.facts) expect(text(card), reference.title).toContain(fact);
      expect(card, reference.title).toContain(reference.source);
    }

    // Conflicting or insufficiently conditioned values must stay out of visible SSR content.
    const quenchLine = text(cards.find((card) => card.includes('RCWT 托辊网带淬火回火线'))!);
    expect(quenchLine).toContain('淬火炉网带速度为 30–250 mm/min');
    expect(quenchLine).toContain('淬火炉和回火炉网带速度 50–300 mm/min');
    expect(quenchLine).not.toMatch(/50[~～–-]500\s*mm\/min/);
    expect(quenchLine.split('2026 年')[0]).not.toMatch(/回火炉(?:网带)?速度(?:为)?\s*30[~～–-]250/);
    const carburizingLine = text(cards.find((card) => card.includes('网带式渗碳气氛热处理生产线'))!);
    expect(carburizingLine).not.toMatch(/(?:5000|6000)\s*件/);
    const doubleStripLine = text(cards.find((card) => card.includes('不锈钢连续退火双带炉'))!);
    expect(doubleStripLine).not.toMatch(/(?:600|620)\s*mm|750\s*t\s*\/\s*d|26\.6\s*m\s*\/\s*min/);

    for (const withdrawnTitle of [
      '3 条 1250 mm 连续退洗线节能改造',
      '1250 mm 连续退洗线退火固溶段',
      'PC200–PC400 支重轮热处理生产线',
      '济宁支重轮热处理生产线',
    ]) expect(text(html)).not.toContain(withdrawnTitle);
    expect(text(evidence)).not.toMatch(/SN-CASE-P0-|\/Users\/|青拓|硕阳|泰兴冶炼|连云港/);
    expect(html).toContain('href="#project-evidence"');
  });
  it('shows three delivery checks with scope, quality and acceptance criteria', () => {
    const checks = section('checkpoints');
    expect(checks.match(/<article\b/g)).toHaveLength(3);
    for (const phrase of ['供货范围', '质量与产能', '验收与资料', '按合同范围'])
      expect(text(checks)).toContain(phrase);
    expect(styles).toMatch(/\.cards \{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  });
  it('preserves the project anchor and directs readers to public cases', () => {
    const experience = section('experience');
    expect(experience).toContain('href="/zh/case"');
    for (const slug of [
      'anonymous-tsingshan-1250-renovation',
      'jining-support-roller-heat-treatment-line',
    ]) {
      expect(html).not.toContain(`href="/zh/case/${slug}"`);
    }
  });
  it('renders the real shared inquiry form with exactly the four customer fields', () => {
    const form = section('inquiry');
    for (const name of ['direction', 'problem', 'identity', 'contact'])
      expect(form.match(new RegExp(`name="${name}"`, 'g'))).toHaveLength(1);
    expect(form).toContain('type="submit"');
    expect(text(form)).toContain('联系方式');
  });
  it('keeps process steps in ordered sequences with process-dependent limits', () => {
    const process = section('process');
    expect(process.match(/<ol\b/g)).toHaveLength(3);
    for (const phrase of ['加热保温', '淬火', '回火', '实际流程按材质、热处理要求和输送方式确定'])
      expect(text(process)).toContain(phrase);
  });
  it('keeps hero wrapping and actions able to wrap at narrow desktop widths', () => {
    expect(html).toContain('<wbr/>');
    expect(styles).toMatch(/\.actions \{[^}]*flex-wrap: wrap/);
    expect(styles).not.toMatch(/\.hero h1 \{[^}]*white-space: nowrap/);
  });
  it('renders seven real answers while only the original third question is open by default', () => {
    const faqs = section('faq');
    const details = [...faqs.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/g)];
    expect(details).toHaveLength(7);
    expect(details.map((match) => match[1].includes('open=""'))).toEqual([
      false,
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(faqs.match(/<summary>/g)).toHaveLength(7);
    const questions = [
      '连续式炉与周期式炉有什么区别？',
      '没有完整工艺资料，也可以咨询吗？',
      '生产线产能需要根据哪些条件确定？',
      '询价前需要提供哪些资料？',
      '已有生产线可以改造扩产吗？',
      '连续生产线的控制系统怎么选？',
      '项目周期和实际停产时间是一回事吗？',
    ];
    details.forEach((detail, index) => {
      const summary = detail[2].match(/<summary>([\s\S]*?)<\/summary>/)?.[1];
      expect(summary, questions[index]).toBeDefined();
      expect(text(summary!), questions[index]).toContain(questions[index]);
      expect(detail[2]).toMatch(/<p>[\s\S]+<\/p>/);
    });
    expect(text(details[4][2])).toContain('不能只提高网带速度就承诺扩产');
    expect(text(details[4][2])).toContain('约定工件、装料和工艺条件下验证');
    expect(text(details[5][2])).toContain('客户系统接口、数据追溯及现场维护能力');
    expect(text(details[5][2])).toContain('不能只看名称或品牌');
    expect(text(details[6][2])).toContain('停产前安排');
    expect(text(details[6][2])).toContain('必要烘炉、调试及负载验证');
    expect(text(details[6][2])).toContain('不能用总交期直接代替停产天数');
  });
  it('renders six real resources covering capacity, acceptance and the three restored decisions', () => {
    const resources = section('resources');
    const cards = [...resources.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(
      (match) => match[0],
    );
    expect(cards).toHaveLength(6);
    const expectedResources = [
      ['生产线产能怎么估算', '/zh/news/shuju-news-36', '阅读整线产能回算方法'],
      ['哪些配置影响设备报价', '/zh/articles/gongye-lu-baojia-canshu', '阅读报价参数清单'],
      ['生产线验收检查哪些项目', '/zh/news/heat-treatment-line-fat-single-machine-acceptance', '阅读生产线验收范围'],
      ['旧线改造还是换新', '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin', '阅读旧炉修、改、换判断'],
      ['控制系统怎么选与升级', '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji', '阅读控制系统升级核对方法'],
      ['项目周期与停产窗口怎么安排', '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi', '阅读改造风险与周期说明'],
    ];
    for (const [title, href, label] of expectedResources) {
      const matchingCards = cards.filter((card) => card.includes(`href="${href}"`));
      expect(matchingCards, title).toHaveLength(1);
      expect(text(matchingCards[0]), href).toContain(title);
      expect(text(matchingCards[0]), href).toContain(label);
    }
    expect(text(resources)).toContain('现场切换与调试验收');
    expect(text(resources)).toContain('保留、替换、备份与回退范围');
  });
  it('keeps horizontal table scrolling within its own region and a mobile layout', () => {
    expect(styles).toContain('overflow-x: auto');
    expect(styles).toContain('@media (max-width: 767px)');
    expect(section('selection-table')).toContain('aria-label="生产线选型表，可横向滚动"');
  });
  it('names table and content regions and keeps every anchor connected', () => {
    expect(section('selection-table')).toContain('tabindex="0"');
    for (const match of html.matchAll(/href="#([^"]+)"/g))
      expect(html).toContain(`id="${match[1]}"`);
    expect(section('resources')).toContain('aria-labelledby="resources-title"');
  });
  it('omits removed source labels and unperformed technical signoff', () => {
    expect(html).not.toContain('aria-label="资料更新与来源"');
    expect(text(html)).not.toMatch(/未登记公开署名|发布复核：|内容复核：|技术审核：苏能技术部/);
  });
});
