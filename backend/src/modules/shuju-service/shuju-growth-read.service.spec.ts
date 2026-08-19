import { BadRequestException } from '@nestjs/common';

import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * 按 SQL 内容路由返回值，而不是按调用次序。
 *
 * 原来用 mockResolvedValueOnce 链，**每加一个查询就要重排一次**——
 * 2026-08-19 一天被这个坑了三次（新增停留覆盖、地区、退出页）。
 * 现在按 SQL 特征匹配，加查询不再牵动已有测试。
 */
function routedQueryRaw(routes: Array<[string, unknown]>) {
  return jest.fn((sql: unknown) => {
    // 用 SQL 原文而不是 JSON.stringify——后者会把双引号转义成 \\"，
    // 标记里得跟着写一堆反斜杠，极易写错（已踩）。
    // 压平空白后匹配：认 SELECT 列表这段身份，别被 GROUP BY 里的同名列骗了。
    const text = ((sql as { strings?: string[] }).strings || [])
      .join('?')
      .replace(/\s+/g, ' ')
      .trim();
    for (const [marker, value] of routes) {
      if (text.includes(marker)) return Promise.resolve(value);
    }
    return Promise.resolve([]);
  });
}

describe('ShujuGrowthReadService', () => {
  it('returns aggregate website behavior without anonymous ids or inquiry content', async () => {
    const queryRaw = routedQueryRaw([
      // 顺序 = 最具体优先。几个坑：
      //  · 'human_signal' 不能用——真人验证门在每个查询的 where 里，到处都有
      //  · 'MAX("pageTitle")' 页面表现和分段明细都有，分段明细要先用 deviceType 截住
      //  · 'GROUP BY day, "eventType"' 是分段明细 GROUP BY 的前缀，日趋势必须排在它后面
      ['MIN(', [{ trackingStartAt: new Date('2026-08-14T16:00:00Z') }]],
      ['last_view', [{ pagePath: '/zh/contact', sessions: 3n }]],
      [
        'SELECT "province"',
        [
          {
            province: '广东省',
            visitors: 5n,
            sessions: 6n,
            engagedVisitors: 2n,
            highIntentVisitors: 1n,
          },
        ],
      ],
      [
        'SELECT "landingPage"',
        [
          {
            landingPage: '/zh/products/detail/trolley-furnace',
            visitors: 6n,
            sessions: 7n,
            pageViews: 10n,
          },
        ],
      ],
      [
        'SELECT "sourceType", NULL::text',
        [
          {
            sourceType: '外部链接',
            sourceDetail: null,
            visitors: 3n,
            pageViews: 5n,
            engagedVisitors: 2n,
            highIntentVisitors: 1n,
            formStarts: 1n,
            stepCompleted: 1n,
            submissions: 1n,
          },
        ],
      ],
      [
        'SELECT "sourceType", "sourceDetail"',
        [
          {
            sourceType: '外部链接',
            sourceDetail: 'example.com',
            visitors: 3n,
            pageViews: 5n,
            engagedVisitors: 2n,
            highIntentVisitors: 1n,
            formStarts: 1n,
            stepCompleted: 1n,
            submissions: 1n,
          },
        ],
      ],
      [
        'WITH scoped AS ( SELECT *',
        [
          {
            pageVisitors: 8n,
            pageViews: 12n,
            visitSessions: 9n,
            engagedSessions: 5n,
            highIntentVisitors: 2n,
            formStartVisitors: 2n,
            stepCompletedVisitors: 1n,
            submissionVisitors: 1n,
          },
        ],
      ],
      [
        'WITH scoped AS ( SELECT "pagePath"',
        [
          {
            pagePath: '/zh/products/detail/trolley-furnace',
            pageVisitors: 100n,
            highIntentVisitors: 8n,
            formStartVisitors: 6n,
            stepCompletedVisitors: 4n,
            submissionVisitors: 2n,
          },
        ],
      ],
      [
        'AS day, "eventType", "pagePath"',
        [
          {
            day: '2026-08-15',
            eventType: 'page_view',
            pagePath: '/zh/products/detail/trolley-furnace',
            pageTitle: '台车炉',
            pageType: '产品页',
            productTag: '台车炉',
            sourceType: '外部链接',
            sourceDetail: 'example.com',
            deviceType: 'PC',
            events: 10n,
            visitors: 6n,
            sessions: 7n,
          },
        ],
      ],
      [
        'SELECT "pagePath", MAX("pageTitle")',
        [
          {
            pagePath: '/zh/products/detail/trolley-furnace',
            pageTitle: '台车炉',
            pageType: '产品页',
            productTag: '台车炉',
            visitors: 6n,
            pageViews: 10n,
            engagedVisitors: 4n,
            highIntentVisitors: 2n,
            formStarts: 1n,
            stepCompleted: 1n,
            submissions: 1n,
          },
        ],
      ],
      [
        'GROUP BY day, "eventType"',
        [{ day: '2026-08-15', eventType: 'page_view', eventCount: 12n, visitorCount: 8n }],
      ],
      [
        'GROUP BY "eventType"',
        [
          { eventType: 'page_view', eventCount: 12n, visitorCount: 8n, sessionCount: 9n },
          { eventType: 'form_submit', eventCount: 2n, visitorCount: 2n, sessionCount: 2n },
        ],
      ],
    ]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-15' });

    expect(result.eventCounts.page_view).toEqual({ events: 12, visitors: 8, sessions: 9 });
    expect(result.coverage).toEqual(
      expect.objectContaining({
        trackingStartAt: '2026-08-14T16:00:00.000Z',
        fullRange: true,
        reason: null,
      }),
    );
    expect(result.funnel).toEqual(
      expect.objectContaining({ pageVisitors: 8, engagedSessions: 5, highIntentVisitors: 2 }),
    );
    expect(result.sourceDetails[0]).toEqual(
      expect.objectContaining({ sourceDetail: 'example.com', submissions: 1 }),
    );
    expect(result.landings[0]).toEqual(
      expect.objectContaining({ pagePath: '/zh/products/detail/trolley-furnace', sessions: 7 }),
    );
    expect(result.pages[0]).toEqual(
      expect.objectContaining({ pagePath: '/zh/products/detail/trolley-furnace', pageViews: 10 }),
    );
    expect(result.segments[0]).toEqual(
      expect.objectContaining({ sourceDetail: 'example.com', deviceType: 'PC', events: 10 }),
    );
    expect(JSON.stringify(result)).not.toMatch(/visitorId|sessionId|phone|email|requirement/);
  });

  it('rejects inverted and oversized date ranges before querying data', async () => {
    const service = new ShujuGrowthReadService({
      $queryRaw: jest.fn(),
    } as unknown as PrismaService);
    await expect(
      service.overview({ startDate: '2026-08-16', endDate: '2026-08-15' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.overview({ startDate: '2025-01-01', endDate: '2026-08-15' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns an empty comparable window when page-view tracking has not started', async () => {
    // 埋点还没开始：覆盖查询返回 null，其余一律空
    const queryRaw = routedQueryRaw([['MIN(', [{ trackingStartAt: null }]]]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-15' });

    expect(result.coverage).toEqual(
      expect.objectContaining({
        trackingStartAt: null,
        fullRange: false,
        reason: 'page_view_not_started',
      }),
    );
    expect(result.funnel).toEqual(
      expect.objectContaining({
        pageVisitors: 0,
        highIntentVisitors: 0,
        submissionVisitors: 0,
      }),
    );
  });

  it('excludes bot traffic from every metric and reports how much was excluded', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const statements = queryRaw.mock.calls.map(([sql]) => JSON.stringify(sql));
    // 每一条业务查询都必须带上排除条件，否则同一页上会出现两套访客口径
    const business = statements.filter(
      (sql) => sql.includes('WebsiteLeadEvent') && !sql.includes('human_signal'),
    );
    expect(business.length).toBeGreaterThan(1);
    for (const sql of business) {
      expect(sql).toContain('userAgent');
    }
    // 服务端写的 form_submit 不带 userAgent，必须放行 NULL，否则询盘会被整批过滤掉
    expect(statements.some((sql) => sql.includes('IS NULL'))).toBe(true);
    // 过滤了多少要能看见，不能悄悄少掉
    expect(result.botFiltered).toEqual(expect.objectContaining({ visitors: 0, events: 0 }));
    expect(result.botFiltered.pattern).toContain('spider');
  });

  it('counts only human-verified identities and reports the unverified remainder', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const statements = queryRaw.mock.calls.map(([sql]) => JSON.stringify(sql));
    // 主统计查询必须带人类验证门:身份必须发过 human_signal 才被计入。
    // 2026-08-18 实测:伪装成浏览器的自动化流量占访客数 80%+,UA 过滤抓不到,
    // 唯一可靠判据是"有没有真实交互"。
    const gated = statements.filter((sql) => sql.includes("= 'human_signal'"));
    expect(gated.length).toBeGreaterThan(3);
    // 未验证访问必须单独回报,不能悄悄消失
    expect(result.unverified).toEqual(expect.objectContaining({ visitors: 0, events: 0 }));
    expect(result.coverage).toEqual(expect.objectContaining({ verified: false }));
  });

  it('keeps the per-page funnel monotonic so the drill-down can show conversion', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const pageFunnel = queryRaw.mock.calls
      .map(([sql]) => JSON.stringify(sql))
      .find((sql) => sql.includes('cohort'));
    expect(pageFunnel).toBeDefined();
    // 每一步都必须是后续步骤的超集，否则单页漏斗又会退回"不可比"
    expect(pageFunnel).toContain('form_start');
    expect(pageFunnel).toContain('form_step_complete');
    expect(pageFunnel).toContain('form_submit');
    // 必须限定在"看过这一页的人"里，否则第5步可能大于第1步
    expect(pageFunnel).toContain('page_view');
  });

  it('buckets days by real Shanghai time, not by misreading the UTC timestamp', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const statements = queryRaw.mock.calls.map(([sql]) => JSON.stringify(sql));
    const dayQueries = statements.filter((sql) => sql.includes('AS day'));
    expect(dayQueries.length).toBeGreaterThan(0);

    // createdAt 是 timestamp without time zone,存的是 UTC。
    // 直接写 AT TIME ZONE 'Asia/Shanghai' 会把它*当成*上海时间去解释,
    // 结果反向偏移 16 小时——凌晨的访问被记到前一天下午。
    // 必须先用 AT TIME ZONE 'UTC' 锚定,再转上海。
    for (const sql of dayQueries) {
      const shanghai = (sql.match(/AT TIME ZONE 'Asia\/Shanghai'/g) ?? []).length;
      const anchored = (sql.match(/AT TIME ZONE 'UTC' AT TIME ZONE 'Asia\/Shanghai'/g) ?? [])
        .length;
      expect(shanghai).toBeGreaterThan(0);
      expect(anchored).toBe(shanghai);
    }
  });

  it('reports when dwell tracking started, without shrinking the window for other metrics', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const statements = queryRaw.mock.calls.map(([sql]) => JSON.stringify(sql));
    const dwellCoverage = statements.filter(
      (sql) => sql.includes('dwell_5s') && sql.includes('MIN'),
    );
    expect(dwellCoverage).toHaveLength(1);
    // 四个刻度必须显式列举：LIKE 'dwell_%' 里的下划线是单字符通配符，会误匹配。
    for (const event of ['dwell_5s', 'dwell_20s', 'dwell_60s', 'dwell_180s']) {
      expect(dwellCoverage[0]).toContain(event);
    }
    expect(dwellCoverage[0]).not.toContain('LIKE');
    // 起点要回报给界面，否则"上线前那些天没有数据"会被显示成真实的零
    expect(result.coverage).toHaveProperty('dwellStartAt');
  });

  it('reports customer regions with the same bot and human gates as every other metric', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const statements = queryRaw.mock.calls.map(([sql]) => JSON.stringify(sql));
    const regionQuery = statements.find((sql) => sql.includes('GROUP BY \\"province\\"'));
    expect(regionQuery).toBeDefined();
    // 地区口径必须和别的数字一致：机器人过滤 + 真人验证门都要在，
    // 否则同一张看板上会出现两套访客口径。
    expect(regionQuery).toContain('userAgent');
    expect(regionQuery).toContain("= 'human_signal'");
    // 没解析出地区的不能凑成一个"未知"省份混进排行
    expect(regionQuery).toContain('IS NOT NULL');
    expect(result).toHaveProperty('regions');
  });

  it('derives exit pages from the last page view of each session, not a new event', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const statements = queryRaw.mock.calls.map(([sql]) => JSON.stringify(sql));
    const exitQuery = statements.find((sql) => sql.includes('last_view'));
    expect(exitQuery).toBeDefined();
    // 必须按时间倒序取每个会话的最后一条——写成正序就变成入口页了。
    // 只断言"含有 DESC"抓不住：ORDER BY sessions DESC 也含 DESC（已踩）。
    expect(exitQuery).toContain('ORDER BY session_key, \\"createdAt\\" DESC');
    expect(exitQuery).not.toContain('ORDER BY session_key, \\"createdAt\\" ASC');
    expect(exitQuery).toContain('DISTINCT ON');
    expect(exitQuery).toContain("'page_view'");
    // 口径要和别的数字一致：机器人过滤 + 真人验证门
    expect(exitQuery).toContain('userAgent');
    expect(exitQuery).toContain("= 'human_signal'");
    expect(result).toHaveProperty('exits');
  });
});
