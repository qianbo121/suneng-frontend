import { Prisma } from '@prisma/client';

import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';
import {
  allowedTraffic,
  BOT_PATTERN,
  readAutomatedSessions,
  readTrafficCoverageStart,
} from '@/modules/shuju-service/shuju-traffic-filter';
import { PrismaService } from '@/prisma/prisma.service';

// Explicit opt-in; only a connection-local table receives synthetic traffic.
const databaseUrl = process.env.CONTENT_GROWTH_TEST_DATABASE_URL;
const integration = databaseUrl ? describe : describe.skip;

integration('traffic exclusions against isolated PostgreSQL', () => {
  const { Client } = jest.requireActual('pg');
  let client: InstanceType<typeof Client>;
  let prisma: PrismaService;
  let service: ShujuGrowthReadService;
  let nextId = 1;
  const day = { startDate: '2026-10-08', endDate: '2026-10-08' };
  const start = new Date('2026-10-07T16:00:00Z');
  const end = new Date('2026-10-08T16:00:00Z');
  const morning = new Date('2026-10-08T02:15:00Z').getTime();
  const publicPrefixes = ['11.10.xxx.xxx', '12.20.xxx.xxx', '13.30.xxx.xxx'];
  const normalUa = 'Mozilla/5.0 (X11; Linux x86_64) Firefox/134.0';
  const alternateUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/17.7';

  beforeAll(async () => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(databaseUrl!).hostname)) {
      throw new Error('Traffic integration tests require a loopback database');
    }
    client = new Client({ connectionString: databaseUrl });
    await client.connect();
    const { readFileSync } = jest.requireActual('node:fs');
    const { join } = jest.requireActual('node:path');
    const schema = readFileSync(join(__dirname, '../../..', 'prisma/schema.prisma'), 'utf8');
    const model = schema.match(/model WebsiteLeadEvent \{([\s\S]*?)\n\}/)[1];
    const types: Record<string, string> = {
      Int: 'integer',
      String: 'text',
      DateTime: 'timestamp',
      Json: 'jsonb',
    };
    const columns = [...model.matchAll(/^\s+(\w+)\s+(Int|String|DateTime|Json)\??\s/gm)].map(
      (match) => `"${match[1]}" ${match[1] === 'submissionId' ? 'uuid' : types[match[2]]}`,
    );
    columns.push(
      `"isBot" boolean GENERATED ALWAYS AS (COALESCE("userAgent" ~* '${BOT_PATTERN}', FALSE)) STORED`,
    );
    await client.query(`CREATE TEMP TABLE "WebsiteLeadEvent" (${columns.join(',')})`);
    await client.query('CREATE INDEX ON "WebsiteLeadEvent" ("sessionId", "createdAt")');
    await client.query('CREATE TEMP TABLE "CustomRequirement" (id integer, "submissionId" uuid)');
    prisma = {
      $queryRaw: (sql: { text: string; values: unknown[] }) =>
        client.query(sql.text, sql.values).then((result: { rows: unknown[] }) => result.rows),
    } as unknown as PrismaService;
    service = new ShujuGrowthReadService(prisma);
  });

  beforeEach(async () => {
    await client.query('TRUNCATE TABLE pg_temp."WebsiteLeadEvent", pg_temp."CustomRequirement"');
    nextId = 1;
  });

  afterAll(async () => {
    if (client) await client.end();
  });

  async function event(
    type: string,
    session: string | null,
    at: number,
    extra: Record<string, unknown> = {},
  ) {
    const row: Record<string, unknown> = {
      id: nextId++,
      eventType: type,
      sessionId: session,
      visitorId: 'visitor-' + session,
      userAgent: normalUa,
      ipMasked: publicPrefixes[0],
      pagePath: '/zh/news/' + session,
      landingPage: '/zh/news/' + session,
      pageTitle: 'Synthetic traffic test',
      pageType: '文章页',
      sourceType: '直接访问',
      sourceDetail: 'test-source',
      province: '合成测试地区',
      regionSource: 'stable_masked_prefix',
      deviceType: 'PC',
      createdAt: new Date(at),
      ...extra,
    };
    const keys = Object.keys(row);
    await client.query(
      `INSERT INTO "WebsiteLeadEvent" (${keys.map((key) => '"' + key + '"').join(',')}) VALUES (${keys.map((_, index) => '$' + (index + 1)).join(',')})`,
      Object.values(row),
    );
  }

  async function visit(
    session: string | null,
    extra: Record<string, unknown> = {},
    prefixes: (string | null)[] = publicPrefixes,
    at = morning,
    offsets = [0, 5000, 20000],
  ) {
    const types = ['page_view', 'dwell_5s', 'dwell_20s'];
    for (let index = 0; index < types.length; index += 1) {
      await event(types[index], session, at + offsets[index], {
        ipMasked: prefixes[Math.min(index, prefixes.length - 1)],
        ...extra,
      });
    }
  }

  async function burst(userAgent = normalUa, at = morning, count = 10, visitorId?: string) {
    for (let index = 0; index < count; index += 1) {
      await visit(
        'seed-' + index,
        { userAgent, ...(visitorId ? { visitorId } : {}) },
        publicPrefixes,
        at + index * 1000,
      );
    }
  }

  it('removes the unmarked burst from overview, content, daily, source, device and region', async () => {
    await burst();
    await event('phone_click', 'seed-0', morning + 25000);
    await event('page_view', 'known-bot', morning - 60000, { userAgent: 'HeadlessChrome' });
    // The associated target has two prefixes, rather than three seed prefixes.
    await visit('rotating-target', {}, publicPrefixes.slice(0, 2));
    await visit(
      'stable-normal',
      {
        visitorId: 'visitor-seed-0',
        sourceType: 'AI引流',
        sourceDetail: 'chatgpt.com',
        province: '保留地区',
        deviceType: '移动端',
      },
      publicPrefixes.slice(0, 1),
      morning + 120000,
    );
    const result = await service.overview(day);
    expect(result.eventCounts.page_view).toEqual({ events: 1, visitors: 1, sessions: 1 });
    expect(result.eventCounts.dwell_20s).toEqual({ events: 1, visitors: 1, sessions: 1 });
    expect(result.funnel.pageViews).toBe(1);
    expect(result.operating.contactVisitors).toBe(0);
    expect(result.content.entryVisits).toBe(1);
    expect(result.content.pages!.map((page) => page.pagePath)).toEqual(['/zh/news/stable-normal']);
    expect(result.daily.filter((row) => row.eventType === 'page_view')).toEqual([
      { date: '2026-10-08', eventType: 'page_view', events: 1, visitors: 1 },
    ]);
    expect(result.sources.map((row) => [row.sourceType, row.pageViews])).toEqual([['AI引流', 1]]);
    expect(result.regions.map((row) => row.province)).toEqual(['保留地区']);
    const mobile = await service.overview({ ...day, device: '移动端' });
    const desktop = await service.overview({ ...day, device: 'PC' });
    expect(mobile.funnel.pageViews).toBe(1);
    expect(desktop.funnel.pageViews).toBe(0);
    expect(await readTrafficCoverageStart(prisma, ['page_view'])).toEqual(
      new Date(morning + 120000),
    );
    expect(await readTrafficCoverageStart(prisma, ['dwell_20s'])).toEqual(
      new Date(morning + 140000),
    );
    expect(await readTrafficCoverageStart(prisma, ['page_view'], true)).toEqual(
      new Date(morning + 120000),
    );
    const excluded = await readAutomatedSessions(prisma, start, end);
    const plain = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
      SELECT id FROM "WebsiteLeadEvent" e WHERE ${allowedTraffic('e', excluded)} ORDER BY id
    `);
    const indexed = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
      SELECT id FROM "WebsiteLeadEvent" e WHERE ${allowedTraffic('e', excluded, true)} ORDER BY id
    `);
    expect(indexed).toEqual(plain);
    expect(plain).toHaveLength(3);
  });

  it('preserves quiet stable visitors, a small VPN switch and slow address changes', async () => {
    await visit('quiet', {}, publicPrefixes.slice(0, 1));
    await visit('two-network-vpn', {}, publicPrefixes.slice(0, 2));
    await visit('isolated-three-network-vpn');
    await visit('slow-network-change', {}, publicPrefixes, morning, [0, 120000, 180000]);
    expect(await readAutomatedSessions(prisma, start, end)).toEqual([]);
    expect((await service.overview(day)).funnel.pageVisitors).toBe(4);
  });

  it('requires distinct seed visitors and a nearby burst, not many visits from one person', async () => {
    await burst(normalUa, morning, 10, 'one-visitor');
    await visit('candidate', {}, publicPrefixes.slice(0, 2));
    expect(await readAutomatedSessions(prisma, start, end)).toEqual([]);
    await client.query('TRUNCATE TABLE pg_temp."WebsiteLeadEvent", pg_temp."CustomRequirement"');
    await burst(normalUa, morning - 60 * 60 * 1000);
    await visit('far-from-burst', {}, publicPrefixes.slice(0, 2));
    const excluded = await readAutomatedSessions(prisma, start, end);
    expect(excluded).toHaveLength(10);
    expect(excluded).not.toContain('far-from-burst');
  });

  it('applies the same pattern to another browser version while rejecting unstable UA sessions', async () => {
    await burst(alternateUa);
    await visit('alternate-target', { userAgent: alternateUa }, publicPrefixes.slice(0, 2));
    await visit('mixed-ua', { userAgent: alternateUa });
    await event('module_view', 'mixed-ua', morning + 25000, { userAgent: normalUa });
    const excluded = await readAutomatedSessions(prisma, start, end);
    expect(excluded).toHaveLength(11);
    expect(excluded).toContain('alternate-target');
    expect(excluded).not.toContain('mixed-ua');
  });

  it('does not infer whole-session exclusion when human interaction or a real submission exists', async () => {
    await burst(normalUa, morning, 9);
    for (const [session, type] of [
      ['human-visit', 'human_signal'],
      ['interaction-visit', 'effective_interaction'],
      ['submitted-visit', 'form_submit'],
    ]) {
      await visit(session);
      await event(type, session, morning + 25000, {
        ...(type === 'form_submit' ? { submissionId: '00000000-0000-4000-8000-000000000001' } : {}),
      });
    }
    await visit('manual-qa-seed', { properties: { manual_qa: true } });
    await visit('explicit-auto-seed', { properties: { automationDetected: true } });
    await visit('unmarked-near-protected', {}, publicPrefixes.slice(0, 2));
    // Protected/marked sessions cannot supply the missing tenth distinct seed.
    expect((await readAutomatedSessions(prisma, start, end)).sort()).toEqual([
      'explicit-auto-seed',
      'manual-qa-seed',
    ]);
    await visit('seed-9');
    const excluded = await readAutomatedSessions(prisma, start, end);
    expect(excluded).toHaveLength(13);
    for (const session of ['human-visit', 'interaction-visit', 'submitted-visit']) {
      expect(excluded).not.toContain(session);
    }
    const result = await service.overview(day);
    expect(result.eventCounts.page_view.events).toBe(3);
    expect(result.eventCounts.form_submit.events).toBe(1);
    expect(result.content.submissions).toBe(1);
    expect(result.operating.inquiries.raw).toBe(1);
  });

  it('excludes manual QA and explicit automation behavior but preserves their real submissions', async () => {
    for (const [session, properties] of [
      ['manual-qa', { manual_qa: true }],
      ['explicit-auto', { automationDetected: true }],
    ] as const) {
      await visit(session);
      // A marker outside the selected date, language and source applies to its visit.
      await event('module_view', session, start.getTime() - 1000, {
        pagePath: '/en/historical-marker',
        sourceType: '外部链接',
        properties,
      });
      await event('form_submit', session, morning + 25000, {
        submissionId:
          session === 'manual-qa'
            ? '00000000-0000-4000-8000-000000000002'
            : '00000000-0000-4000-8000-000000000003',
        userAgent: null,
      });
    }
    await visit('legacy-auto');
    await event('automation_signal', 'legacy-auto', morning + 25000);
    // More than one coverage batch of early marked views must be skipped.
    await client.query(
      `INSERT INTO "WebsiteLeadEvent"
        (id, "eventType", "sessionId", "visitorId", "userAgent", "ipMasked", "createdAt")
        SELECT $1 + ordinal, 'page_view', 'manual-qa', 'visitor-manual-qa', $2, $3,
          $4::timestamp + ordinal * INTERVAL '1 millisecond'
        FROM GENERATE_SERIES(0, 129) ordinal`,
      [nextId, normalUa, publicPrefixes[0], new Date(start.getTime() - 60000)],
    );
    nextId += 130;
    await visit(
      'manual-false',
      { properties: { manual_qa: false } },
      publicPrefixes.slice(0, 1),
      morning + 60000,
    );
    const result = await service.overview(day);
    expect(result.eventCounts.page_view.events).toBe(1);
    expect(result.eventCounts.form_submit.events).toBe(2);
    expect(result.content.submissions).toBe(2);
    expect(result.operating.inquiries).toEqual({
      raw: 2,
      valid: null,
      excluded: null,
      pending: null,
      unknown: null,
    });
    await client.query(
      'INSERT INTO pg_temp."CustomRequirement" (id,"submissionId") VALUES (21,$1),(22,$2)',
      ['00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003'],
    );
    const reviewed = await service.overview({
      ...day,
      inquiryReview: { version: 1, validIds: [21], excludedIds: [22], pendingIds: [] },
    });
    expect(reviewed.operating.inquiries).toEqual({
      raw: 2,
      valid: 1,
      excluded: 1,
      pending: 0,
      unknown: 0,
    });
    expect(result.content.pages!.map((page) => page.pagePath).sort()).toEqual([
      '/zh/news/explicit-auto',
      '/zh/news/manual-false',
      '/zh/news/manual-qa',
    ]);
    expect(await readTrafficCoverageStart(prisma, ['page_view'])).toEqual(
      new Date(morning + 60000),
    );
  });

  it('does not use empty identifiers, IPv6, private networks or malformed prefixes as evidence', async () => {
    await burst();
    await visit(null, { visitorId: null });
    await visit('', { visitorId: '' });
    await visit('ipv6', {}, ['ipv6', '2001:db8::1', '::1']);
    await visit('private-ip', {}, ['10.1.xxx.xxx', '172.16.xxx.xxx', '192.168.xxx.xxx']);
    await visit('invalid-prefix', {}, ['999.1.xxx.xxx', '11.999.xxx.xxx', 'not-an-ip']);
    await visit('no-visitor-id', { visitorId: null });
    await visit('empty-visitor-id', { visitorId: '' });
    await visit('missing-one-prefix', {}, [publicPrefixes[0], publicPrefixes[1], null]);
    await visit('shared-carrier-network', {}, [
      publicPrefixes[0],
      publicPrefixes[1],
      '100.64.xxx.xxx',
    ]);
    const excluded = await readAutomatedSessions(prisma, start, end);
    expect(excluded).toHaveLength(10);
    for (const session of [
      '',
      'ipv6',
      'private-ip',
      'invalid-prefix',
      'no-visitor-id',
      'empty-visitor-id',
      'missing-one-prefix',
      'shared-carrier-network',
    ]) {
      expect(excluded).not.toContain(session);
    }
    expect((await service.overview(day)).eventCounts.page_view.events).toBe(9);
  });

  it('uses seed history across midnight and outside selected language/source/device filters', async () => {
    await burst(normalUa, start.getTime() - 120000);
    await visit(
      'cross-boundary-target',
      {
        sourceType: 'AI引流',
        sourceDetail: 'chatgpt.com',
        deviceType: '移动端',
      },
      publicPrefixes.slice(0, 2),
      start.getTime() + 30000,
    );
    await visit(
      'cross-boundary-normal',
      {
        sourceType: 'AI引流',
        sourceDetail: 'chatgpt.com',
        deviceType: '移动端',
      },
      publicPrefixes.slice(0, 1),
      start.getTime() + 30000,
    );
    const excluded = await readAutomatedSessions(prisma, start, end);
    expect(excluded).toEqual(['cross-boundary-target']);
    const result = await service.overview({
      ...day,
      site: 'zh',
      sourceType: 'AI引流',
      device: '移动端',
      pageType: '文章页',
    });
    expect(result.eventCounts.page_view.events).toBe(1);
    expect(result.content.entryVisits).toBe(1);
    expect(result.content.pages!.map((page) => page.pagePath)).toEqual([
      '/zh/news/cross-boundary-normal',
    ]);
    expect(result.sources.map((row) => row.pageViews)).toEqual([1]);
    expect(result.daily.filter((row) => row.eventType === 'page_view')[0].events).toBe(1);
    expect(await readTrafficCoverageStart(prisma, ['page_view'])).toEqual(
      new Date(start.getTime() + 30000),
    );
  });

  it('deduplicates one normal visitor across two days while preserving one visitor per day and one operating contact', async () => {
    const firstDay = morning - 86400000;
    for (const [session, at] of [
      ['same-visitor-day-one', firstDay],
      ['same-visitor-day-two', morning],
    ] as const) {
      await visit(session, { visitorId: 'one-normal-visitor' }, publicPrefixes.slice(0, 1), at);
      await event('phone_click', session, at + 25000, { visitorId: 'one-normal-visitor' });
    }
    const result = await service.overview({ startDate: '2026-10-07', endDate: '2026-10-08' });
    expect(result.eventCounts.page_view).toEqual({ events: 2, visitors: 1, sessions: 2 });
    expect(result.eventCounts.dwell_20s).toEqual({ events: 2, visitors: 1, sessions: 2 });
    expect(result.operating.contactVisitors).toBe(1);
    expect(result.sources[0].contactVisitors).toBe(1);
    expect(
      result.daily
        .filter((row) => row.eventType === 'page_view')
        .map((row) => [row.date, row.visitors]),
    ).toEqual([
      ['2026-10-07', 1],
      ['2026-10-08', 1],
    ]);
    expect(
      result.daily
        .filter((row) => row.eventType === 'dwell_20s')
        .map((row) => [row.date, row.visitors]),
    ).toEqual([
      ['2026-10-07', 1],
      ['2026-10-08', 1],
    ]);
    expect(result.content.entryVisits).toBe(2);
  });
});
