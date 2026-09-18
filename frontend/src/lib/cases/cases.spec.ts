import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
// Next supplies the server React cache; plain React 18 in Vitest does not.
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
import { readCaseDirectory, getPublicCases, createCaseDirectoryReader } from './server';
import { PUBLIC_CASE_SLUGS } from './public-case-allowlist';
import * as content from './content';
import { prepareCaseBody } from './content';
import {
  caseListHref,
  filterCases,
  hasCaseSearch,
  paginateCases,
  parseCaseQuery,
  safeCaseReturn,
  toCaseCard,
} from './query';
import type { CaseMeta } from './types';

const temporary: string[] = [];
afterEach(() => vi.restoreAllMocks());
afterEach(() =>
  temporary
    .splice(0)
    .forEach((directory) => fs.rmSync(directory, { recursive: true, force: true })),
);
function fixture(index: number): CaseMeta & { searchText: string } {
  return {
    id: `fixture-${index}`,
    slug: `fixture-${index}`,
    title: `支重轮项目${index}`,
    summary: '设备设计与工艺接口',
    body: 'body.md',
    publicationStatus: 'published',
    contentType: 'experience',
    projectStatus: 'experience',
    workpiece: ['支重轮'],
    process: [index % 2 ? '淬火' : '回火'],
    equipment: ['连续线'],
    need: ['新建产线'],
    materials: ['钢'],
    tags: ['支重轮'],
    facts: [
      { label: '设计温度', value: '900', unit: '℃' },
      { label: '工艺', value: '热处理' },
    ],
    sourceSummary: '隔离测试资料',
    dateModified: `2026-08-${String(index + 1).padStart(2, '0')}`,
    projectYear: 2020 + index,
    searchText: `支重轮项目${index} 热处理 公开正文中的联锁系统`,
  };
}

describe('case publishing and browsing contract', () => {
  it.each([
    '资料来源与沟通', '资料来源与继续了解', '资料来源',
    'Sources and project discussion', 'Sources and enquiries',
    'Sources and contact', 'Sources and further reading', 'Sources',
  ])('omits the %s section without removing adjacent technical content', (title) => {
    const body = prepareCaseBody([
      '## 工艺条件', '', '升温和保温共计120分钟，不是单独保温。', '',
      `## ${title}`, '', '内部来源文件及页码。', '',
      '### 原件清单', '', '- 历史方案第1至7页', '',
      '## 后续选型', '', '[查看设备](/zh/products)',
    ].join('\n'));
    expect(body.toc.map((item) => item.title)).toEqual(['工艺条件', '后续选型']);
    expect(body.html).toContain('升温和保温共计120分钟，不是单独保温。');
    expect(body.html).toContain('href="/zh/products"');
    expect(body.html).not.toMatch(/内部来源|原件清单|历史方案第/);
    expect(body.plainText).not.toContain(title);
  });

  it('retains source-related engineering headings and articles without a source section', () => {
    const body = prepareCaseBody('## Source details still requiring reconciliation\n\nConfirm the stated 600 kg load includes fixtures.', 'en');
    expect(body.toc[0].title).toBe('Source details still requiring reconciliation');
    expect(body.plainText).toContain('600 kg load includes fixtures');
  });

  it('reuses unchanged bodies while reflecting edits, withdrawals, deletion and republishing immediately', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'suneng-case-live-'));
    temporary.push(directory);
    const metaPath = path.join(directory, 'case.json');
    const bodyPath = path.join(directory, 'body.md');
    const meta = fixture(1);
    const markdown = '## 初始正文\n\n检索甲';
    fs.writeFileSync(metaPath, JSON.stringify(meta));
    fs.writeFileSync(bodyPath, markdown);
    const render = vi.spyOn(content, 'prepareCaseBody');
    const read = createCaseDirectoryReader(directory);
    expect(read()[0].searchText).toContain('检索甲');
    expect(read()).toHaveLength(1);
    expect(render).toHaveBeenCalledTimes(1);

    // Metadata does not depend on the body cache, even with unchanged timestamps.
    fs.writeFileSync(metaPath, JSON.stringify({ ...meta, title: '新标题' }));
    expect(read()[0].title).toBe('新标题');
    expect(render).toHaveBeenCalledTimes(1);
    const stat = fs.statSync(bodyPath);
    fs.writeFileSync(bodyPath, '## 修改正文\n\n检索乙<script>unsafe()</script>');
    fs.utimesSync(bodyPath, stat.atime, stat.mtime);
    const edited = read()[0];
    expect(edited.searchText).toContain('检索乙');
    expect(edited.searchText).not.toContain('检索甲');
    expect(edited.html).not.toContain('<script>');
    expect(edited.toc[0].title).toBe('修改正文');
    expect(render).toHaveBeenCalledTimes(2);

    // Withdrawals must stop body reads and discard any previously public version.
    fs.writeFileSync(metaPath, JSON.stringify({ ...meta, publicationStatus: 'draft' }));
    fs.unlinkSync(bodyPath);
    expect(read()).toEqual([]);
    expect(render).toHaveBeenCalledTimes(2);
    fs.writeFileSync(metaPath, JSON.stringify(meta));
    fs.writeFileSync(bodyPath, markdown);
    expect(read()[0].searchText).toContain('检索甲');
    expect(render).toHaveBeenCalledTimes(3);
    fs.unlinkSync(metaPath);
    expect(read()).toEqual([]);
    fs.writeFileSync(metaPath, JSON.stringify(meta));
    expect(read()).toHaveLength(1);
    expect(render).toHaveBeenCalledTimes(4);
  });

  it('finds explicit trolley aliases without broadening mixed equipment or bookmarked subtypes', () => {
    const records = [
      { ...fixture(1), equipment: ['台车式电阻炉'] },
      { ...fixture(2), equipment: ['燃气台车炉'] },
      { ...fixture(3), equipment: ['台车式罩式炉'] },
      { ...fixture(4), equipment: ['台车式旋转固化炉'] },
      { ...fixture(5), equipment: ['箱式电阻炉'] },
      { ...fixture(6), equipment: ['台车炉'], publicationStatus: 'draft' as const },
    ];
    expect(filterCases(records, parseCaseQuery({ equipment: '台车炉' })).map((item) => item.id).sort())
      .toEqual(['fixture-1', 'fixture-2']);
    expect(filterCases(records, parseCaseQuery({ equipment: '台车式电阻炉' })).map((item) => item.id))
      .toEqual(['fixture-1']);
    expect(filterCases(records, parseCaseQuery({ equipment: '台车炉', process: '淬火' })).map((item) => item.id))
      .toEqual(['fixture-1']);
  });
  it('restores combined URL state and rejects external return paths', () => {
    const query = parseCaseQuery({
      q: ' 支重轮 ',
      workpiece: '支重轮',
      process: '淬火',
      need: '新建产线',
      sort: 'year',
      page: '3',
      from: '1',
    });
    expect(parseCaseQuery(new URL(caseListHref(query), 'https://test').searchParams)).toEqual(
      query,
    );
    expect(safeCaseReturn(caseListHref(query))).toBe(caseListHref(query));
    for (const url of [
      'https://evil.test/zh/case',
      '//evil.test/zh/case',
      '/zh/case/../contact',
      'javascript:alert(1)',
    ])
      expect(safeCaseReturn(url)).toBe('/zh/case');
    expect(parseCaseQuery({ page: '-2', from: 'Infinity', sort: 'unknown' })).toMatchObject({
      page: 1,
      from: 1,
      sort: 'relevance',
    });
    expect(hasCaseSearch(parseCaseQuery({ page: '2' }))).toBe(false);
    expect(hasCaseSearch(parseCaseQuery({ process: '淬火' }))).toBe(true);
  });

  it('uses AND filters, public body search and deterministic sorting', () => {
    const records = Array.from({ length: 10 }, (_, i) => fixture(i));
    const result = filterCases(
      records,
      parseCaseQuery({
        q: '联锁系统',
        process: '淬火',
        workpiece: '支重轮',
        equipment: '连续线',
        need: '新建产线',
        sort: 'year',
      }),
    );
    expect(result.map((item) => item.id)).toEqual([
      'fixture-9',
      'fixture-7',
      'fixture-5',
      'fixture-3',
      'fixture-1',
    ]);
    expect(filterCases(records, parseCaseQuery({ process: '不存在' }))).toEqual([]);
    records[0].publicationStatus = 'draft';
    expect(filterCases(records, parseCaseQuery({}))).toHaveLength(9);
  });

  it('provides ten-item pages without overlap, including legacy accumulated URLs', () => {
    const records = Array.from({ length: 25 }, (_, i) => fixture(i));
    const first = paginateCases(records, parseCaseQuery({}));
    const second = paginateCases(records, parseCaseQuery({ page: '2' }));
    const restored = paginateCases(records, parseCaseQuery({ page: '2', from: '1' }));
    expect(first.items).toHaveLength(10);
    expect(second.items).toHaveLength(10);
    expect(restored.items).toEqual(second.items);
    expect(restored.from).toBe(2);
    expect(new Set([...first.items, ...second.items].map((item) => item.id)).size).toBe(20);
    expect(first.nextHref).toBe('/zh/case?page=2');
    const last = paginateCases(records, parseCaseQuery({ page: '3' }));
    expect(last.items).toHaveLength(5);
    expect(last.nextHref).toBeNull();
    expect(paginateCases(records.slice(0, 2), parseCaseQuery({})).nextHref).toBeNull();
  });

  it('adds content from data alone and excludes drafts before reading body or private fields', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'suneng-case-fixture-'));
    temporary.push(directory);
    fs.writeFileSync(
      path.join(directory, 'draft.json'),
      JSON.stringify({
        ...fixture(1),
        publicationStatus: 'draft',
        body: 'missing-secret.md',
        title: 'private-draft-marker',
      }),
    );
    fs.writeFileSync(
      path.join(directory, 'published.json'),
      JSON.stringify({
        ...fixture(2),
        listTitle: '列表项目主体名称',
        listSummary: '列表一句话摘要',
        internalCost: 'private-cost-marker',
        supplier: 'private-supplier-marker',
      }),
    );
    fs.writeFileSync(path.join(directory, 'body.md'), '## 公开新增案例\n\n可检索的正文内容。');
    const records = readCaseDirectory(directory);
    expect(records).toHaveLength(1);
    expect(toCaseCard(records[0]).listTitle).toBe('列表项目主体名称');
    expect(toCaseCard(records[0]).title).toBe(fixture(2).title);
    expect(toCaseCard(records[0]).summary).toBe('列表一句话摘要');
    expect(records[0].summary).toBe(fixture(2).summary);
    expect(records[0].toc).toHaveLength(1);
    expect(JSON.stringify(records)).not.toContain('private-');
    expect(filterCases(records, parseCaseQuery({ q: '可检索的正文' }))).toHaveLength(1);
    expect(filterCases(records, parseCaseQuery({ q: '列表一句话摘要' }))).toHaveLength(1);
    expect(JSON.stringify(toCaseCard(records[0]))).not.toContain('searchText');
    expect(JSON.stringify(toCaseCard(records[0]))).not.toContain('可检索的正文');
    fs.writeFileSync(
      path.join(directory, 'duplicate.json'),
      fs.readFileSync(path.join(directory, 'published.json')),
    );
    expect(() => readCaseDirectory(directory)).toThrow('重复');
  });

  it('renders safe complete HTML with stable duplicate headings and scrollable tables', () => {
    const body = prepareCaseBody(
      '## 工况\n\n正文内容。\n\n### 子标题\n\n## 工况\n\n| 参数 | 值 |\n| --- | --- |\n| 温度 | 700℃ |\n\n<script>alert(1)</script><img src="/images/test.png" onerror="alert(1)"><a href="javascript:alert(1)">链接</a>',
    );
    expect(body.toc.map((item) => item.id)).toEqual(['工况', '工况-2']);
    expect(body.html).toContain('<h3>子标题</h3>');
    expect(body.html).toContain('<table>');
    expect(body.html).toContain('case-table-scroll');
    expect(body.html).not.toMatch(/<script|onerror|javascript:/);
    expect(prepareCaseBody('## 工况').toc[0].id).toBe(body.toc[0].id);
  });

  it('keeps a published file private until its slug is approved, without reading its body', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'suneng-case-approval-'));
    temporary.push(directory);
    const approved = { ...fixture(1), searchText: undefined };
    const pending = { ...fixture(2), searchText: undefined, body: 'pending.md' };
    fs.writeFileSync(path.join(directory, 'approved.json'), JSON.stringify(approved));
    fs.writeFileSync(path.join(directory, 'body.md'), '## 公开正文\n\n已审核。');
    fs.writeFileSync(path.join(directory, 'pending.json'), JSON.stringify(pending));
    // pending.md is intentionally missing: reading it would throw.
    const records = readCaseDirectory(directory, undefined, new Set([approved.slug]));
    expect(records.map((item) => item.slug)).toEqual([approved.slug]);
    expect(readCaseDirectory(directory, undefined, new Set())).toEqual([]);
  });

  it("retains archived engineering boundaries while only approved cases are public", () => {
    expect(getPublicCases().map((item) => item.slug)).toEqual([...PUBLIC_CASE_SLUGS]);
    // Both surviving drafts must keep design figures separated from verified
    // results in their own wording, not only in a JSON label.
    const root=path.join(process.cwd(), 'content/cases');
    const boundaries: Record<string, string[]> = {
      'jining-support-roller': ['不等于各规格已经获得相同的淬硬效果', '这些是方案参数，不是实际验收产能'],
      'continuous-line-renovation': ['不代表三条线已经完成改造或通过验收', '未经验证的方案测算不作为对外结果'],
    };
    for (const [name, phrases] of Object.entries(boundaries)) {
      const meta=JSON.parse(fs.readFileSync(path.join(root,`${name}.json`),'utf8'));
      expect(meta.publicationStatus, name).toBe('draft');
      expect(meta.projectStatus, name).toBe('proposal');
      const body=fs.readFileSync(path.join(root,meta.body),'utf8');
      for (const phrase of phrases) expect(body, `${name}: ${phrase}`).toContain(phrase);
    }
  });
});
