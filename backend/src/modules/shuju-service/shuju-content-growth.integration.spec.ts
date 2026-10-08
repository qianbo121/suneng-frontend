import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';

// Opt-in local PostgreSQL contract test. All inserts go into a connection-local temp table.
const databaseUrl = process.env.CONTENT_GROWTH_TEST_DATABASE_URL;
const pgliteModule = process.env.CONTENT_GROWTH_TEST_PGLITE_MODULE;
const integration = databaseUrl || pgliteModule ? describe : describe.skip;

integration('content growth against PostgreSQL', () => {
  const { Client } = jest.requireActual('pg');
  let client: InstanceType<typeof Client>;
  let service: ShujuGrowthReadService;
  let executeMigration: (sql: string) => Promise<unknown>;
  const range = { startDate: '2026-09-14', endDate: '2026-09-15' };
  const articleA = '/zh/news/acceptance';
  const articleB = '/zh/news/energy';
  const automationRange = { startDate: '2026-10-02', endDate: '2026-10-07' };
  let nextId = 1;
  let event: (
    type: string,
    path: string,
    session: string | null,
    at: string,
    extra?: Record<string, unknown>,
  ) => Promise<void>;

  beforeAll(async () => {
    if (pgliteModule) {
      const { PGlite } = jest.requireActual(pgliteModule);
      const db = new PGlite();
      await db.waitReady;
      client = { query: db.query.bind(db), end: db.close.bind(db) };
      executeMigration = db.exec.bind(db);
    } else {
      const target = new URL(databaseUrl!);
      if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) {
        throw new Error('Content integration tests require a loopback database');
      }
      client = new Client({ connectionString: databaseUrl });
      await client.connect();
      executeMigration = client.query.bind(client);
    }
    // The developer's persistent database may predate current migrations. Derive just
    // the primitive columns from the checked-in model; never migrate their database.
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
    await client.query(`CREATE TEMP TABLE "WebsiteLeadEvent" (${columns.join(',')})`);
    await client.query('CREATE INDEX ON "WebsiteLeadEvent" ("sessionId", "createdAt")');
    // The bot flag is a generated column, so Prisma's schema does not describe it and the
    // loop above cannot derive it. Run the migration itself against the temp table (which
    // shadows the real one) rather than restating the definition, so this test can never
    // drift from what production computes.
    await executeMigration(
      readFileSync(
        join(
          __dirname,
          '../../..',
          'prisma/migrations/20260918160000_website_lead_event_is_bot/migration.sql',
        ),
        'utf8',
      ),
    );
    await client.query(
      'CREATE TEMP TABLE "CustomRequirement" (id integer PRIMARY KEY, "submissionId" uuid UNIQUE)',
    );
    await client.query(`INSERT INTO "CustomRequirement" VALUES
      (10, '00000000-0000-4000-8000-000000000001'),
      (11, '00000000-0000-4000-8000-000000000002'),
      (12, '00000000-0000-4000-8000-000000000003')`);
    event = async (
      type: string,
      path: string,
      session: string | null,
      at: string,
      extra: Record<string, unknown> = {},
    ) => {
      const row: Record<string, unknown> = {
        id: nextId++,
        eventType: type,
        pagePath: path,
        pageType: path.includes('/news/') ? '文章页' : '联系页',
        pageTitle: path.split('/').pop(),
        landingPage: articleA,
        sessionId: session,
        visitorId: 'private-visitor',
        sourceType: 'AI引流',
        sourceDetail: 'chatgpt.com',
        deviceType: 'PC',
        createdAt: new Date(at),
        userAgent: 'Mozilla/5.0',
        ...extra,
      };
      const keys = Object.keys(row);
      await client.query(
        `INSERT INTO "WebsiteLeadEvent" (${keys.map((key) => '"' + key + '"').join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')})`,
        Object.values(row),
      );
    };
    // Prior-period entry must not be counted as a new entry when this visit continues.
    await event('page_view', articleA, 'private-prior-session', '2026-09-13T15:55:00Z');
    await event('page_view', articleA, 'private-prior-session', '2026-09-13T16:05:00Z');
    // Article A → B → contact submission, then C is read after the submission.
    await event(
      'page_view',
      articleA + '?utm_source=chatgpt',
      'private-session-one',
      '2026-09-14T01:00:00Z',
    );
    await event('page_view', articleB, 'private-session-one', '2026-09-14T01:01:00Z');
    await event('wechat_click', articleA, 'private-session-one', '2026-09-14T01:01:30Z');
    await event('form_submit', '/zh/inquiry', 'private-session-one', '2026-09-14T01:02:00Z', {
      submissionId: '00000000-0000-4000-8000-000000000001',
    });
    await event(
      'page_view',
      '/zh/news/after-submit',
      'private-session-one',
      '2026-09-14T01:03:00Z',
    );
    // Same visitor, different visit: not attributed to the earlier submission.
    await event('page_view', articleB, 'private-session-two', '2026-09-15T01:00:00Z', {
      landingPage: articleB,
    });
    // A true same-page submission is included once in both direct and associated counts.
    await event('form_submit', articleB, 'private-session-two', '2026-09-15T01:01:00Z', {
      submissionId: '00000000-0000-4000-8000-000000000002',
    });
    // Unidentified traffic and a real unlinked submission remain visible, not invented visits.
    await event('page_view', '/zh/news/unidentified', null, '2026-09-15T02:00:00Z');
    await event('form_submit', '/zh/inquiry', null, '2026-09-15T02:01:00Z', {
      submissionId: '00000000-0000-4000-8000-000000000003',
    });
    await event('form_submit', articleA, 'private-session-one', '2026-09-14T01:04:00Z');
    await event('page_view', articleA, 'bot-session', '2026-09-15T03:00:00Z', {
      userAgent: 'Googlebot',
    });
    await event('page_view', '/en/news/english', 'english-session', '2026-09-15T04:00:00Z', {
      landingPage: '/en/news/english',
      sourceType: '自然搜索',
      sourceDetail: 'www.baidu.com',
    });
    // A historical marker outside the selected date, language and source still applies
    // to this visit. The same visitor's later, separate normal visit must survive.
    await event('automation_signal', '/en/history', 'marked-session', '2026-09-20T01:00:00Z', {
      visitorId: 'shared-visitor',
      sourceType: '外部链接',
      sourceDetail: 'example.com',
    });
    const trafficVisit = async (
      session: string,
      at: string,
      extra: Record<string, unknown> = {},
    ) => {
      for (const type of [
        'page_view',
        'dwell_5s',
        'dwell_20s',
        'effective_interaction',
        'phone_click',
      ]) {
        await event(type, '/zh/news/statistics-' + session, session, at, {
          landingPage: '/zh/news/statistics-' + session,
          visitorId: 'shared-visitor',
          ...extra,
        });
      }
    };
    await trafficVisit('marked-session', '2026-10-02T01:00:00Z');
    await event('form_submit', '/zh/inquiry', 'marked-session', '2026-10-02T01:02:00Z', {
      submissionId: '00000000-0000-4000-8000-000000000004',
      visitorId: 'shared-visitor',
      userAgent: null,
      properties: { automationDetected: true },
    });
    await trafficVisit('real-session', '2026-10-03T01:00:00Z');
    // A property on any successfully recorded event works if a standalone marker was lost.
    await event('page_view', '/en/property-marker', 'property-session', '2026-10-01T01:00:00Z', {
      properties: { automationDetected: true },
      sourceType: '外部链接',
    });
    await trafficVisit('property-session', '2026-10-04T01:00:00Z');
    // Later evidence must correct an earlier visit as well, without changing its raw rows.
    await trafficVisit('later-marked-session', '2026-10-05T01:00:00Z');
    await event(
      'automation_signal',
      '/en/later-marker',
      'later-marked-session',
      '2026-10-08T01:00:00Z',
    );
    await trafficVisit('known-bot-session', '2026-10-06T01:00:00Z', { userAgent: 'Googlebot' });
    // Empty identifiers cannot connect unrelated records into one automated session.
    await event('automation_signal', '/en/empty-marker', '', '2026-10-01T02:00:00Z');
    await event('automation_signal', '/en/null-marker', null, '2026-10-01T02:01:00Z');
    await event('page_view', '/zh/news/statistics-empty', '', '2026-10-07T01:00:00Z', {
      visitorId: 'empty-session-visitor',
      landingPage: '/zh/news/statistics-empty',
    });
    await event('page_view', '/zh/news/statistics-null', null, '2026-10-07T01:01:00Z', {
      visitorId: 'null-session-visitor',
      landingPage: '/zh/news/statistics-null',
    });
    await event(
      'page_view',
      '/zh/news/statistics-property-without-session',
      null,
      '2026-10-07T01:02:00Z',
      {
        visitorId: 'automated-unknown-session',
        properties: { automationDetected: true },
      },
    );
    service = new ShujuGrowthReadService({
      $queryRaw: (sql: { text: string; values: unknown[] }) =>
        client.query(sql.text, sql.values).then((result: { rows: unknown[] }) => result.rows),
    } as unknown as PrismaService);
  }, 30000);

  afterAll(async () => {
    if (client) await client.end();
  });

  beforeEach(async () => {
    await client.query('BEGIN');
  });
  afterEach(async () => {
    await client.query('ROLLBACK');
  });

  it('reconciles entry totals, dates and sources without repeating cross-midnight visits', async () => {
    const result = await service.overview(range);
    const content = result.content;
    const page = content.pages!.find((row) => row.pagePath === articleA)!;
    expect(content.status).toBe('available');
    expect(page.entryVisits).toBe(1);
    expect(page.pageViews).toBe(2);
    expect(page.contacts).toBe(1);
    expect(page.daily).toEqual([{ date: '2026-09-14', visits: 1 }]);
    expect(page.sources.reduce((sum, row) => sum + row.visits, 0)).toBe(page.entryVisits);
    expect(content.entryVisits).toBe(3);
    expect(content.daily!.reduce((sum, row) => sum + row.visits, 0)).toBe(3);
    expect(content.sources!.reduce((sum, row) => sum + row.visits, 0)).toBe(3);
    expect(content.pages!.some((row) => row.pagePath.includes('?'))).toBe(false);
  });

  it('associates only reads before real submissions in the same visit and deduplicates globally', async () => {
    const result = await service.overview(range);
    const a = result.content.pages!.find((row) => row.pagePath === articleA)!;
    const b = result.content.pages!.find((row) => row.pagePath === articleB)!;
    const after = result.content.pages!.find((row) => row.pagePath === '/zh/news/after-submit')!;
    expect([a.directSubmissions, a.associatedSubmissions, a.crossPageSubmissions]).toEqual([
      0, 1, 1,
    ]);
    expect([b.directSubmissions, b.associatedSubmissions, b.crossPageSubmissions]).toEqual([
      1, 2, 1,
    ]);
    expect(after.associatedSubmissions).toBe(0);
    expect(result.content.submissions).toBe(3);
    expect(result.content.unlinkedSubmissions).toBe(1);
    expect(result.content.unidentifiedPageViews).toBe(1);
    expect(JSON.stringify(result.content)).not.toMatch(
      /private-|sessionId|visitorId|00000000-0000|submissionId/,
    );
  });

  it('keeps article-scoped cross-page inquiries and source/site filters consistent', async () => {
    const result = await service.overview({
      ...range,
      site: 'zh',
      sourceType: 'AI引流',
      pageType: '文章页',
    });
    expect(result.content.entryVisits).toBe(2);
    expect(result.content.submissions).toBe(2);
    expect(result.content.pages!.every((row) => row.pagePath.startsWith('/zh/news/'))).toBe(true);
    const search = await service.overview({ ...range, sourceType: '自然搜索' });
    expect(search.content.entryVisits).toBe(1);
    expect(search.content.pages!.map((row) => row.pagePath)).toEqual(['/en/news/english']);
    expect(search.content.sources).toEqual([{ sourceType: '自然搜索', visits: 1 }]);
  });

  it('keeps review unavailable without a list, and excludes all three reviewed inquiry IDs everywhere', async () => {
    const unreviewed = await service.overview(range);
    expect(unreviewed.operating.inquiries).toEqual({
      raw: 3,
      valid: null,
      excluded: null,
      pending: null,
      unknown: null,
    });
    expect(unreviewed.content.pages!.every((p) => p.validAssociatedSubmissions === null)).toBe(
      true,
    );
    expect(unreviewed.sources.every((s) => s.validSubmissions === null)).toBe(true);
    const result = await service.overview({
      ...range,
      inquiryReview: {
        version: 1,
        validIds: [],
        excludedIds: [10, 11, 12],
        pendingIds: [],
      },
    });
    expect(result.operating.inquiries).toEqual({
      raw: 3,
      valid: 0,
      excluded: 3,
      pending: 0,
      unknown: 0,
    });
    for (const page of result.content.pages!) {
      expect([
        page.validDirectSubmissions,
        page.validAssociatedSubmissions,
        page.validCrossPageSubmissions,
      ]).toEqual([0, 0, 0]);
    }
    expect(result.sources.reduce((sum, s) => sum + s.excludedSubmissions!, 0)).toBe(3);
    expect(result.sourceDetails.reduce((sum, s) => sum + s.excludedSubmissions!, 0)).toBe(3);
    expect(result.sources.every((s) => s.validSubmissions === 0)).toBe(true);
    expect(result.sourceDetails.every((s) => s.validSubmissions === 0)).toBe(true);
  });

  it('deduplicates one valid cross-page inquiry globally and never promotes pending or unknown inquiries', async () => {
    const result = await service.overview({
      ...range,
      pageType: '文章页',
      inquiryReview: {
        version: 1,
        validIds: [10],
        excludedIds: [],
        pendingIds: [11],
      },
    });
    expect(result.operating.inquiries).toEqual({
      raw: 2,
      valid: 1,
      excluded: 0,
      pending: 1,
      unknown: 0,
    });
    const a = result.content.pages!.find((p) => p.pagePath === articleA)!;
    const b = result.content.pages!.find((p) => p.pagePath === articleB)!;
    expect([a.validAssociatedSubmissions, b.validAssociatedSubmissions]).toEqual([1, 1]);
    expect([a.validDirectSubmissions, b.validDirectSubmissions]).toEqual([0, 0]);
    expect(result.sources.find((s) => s.sourceType === 'AI引流')!.validSubmissions).toBe(1);
    const global = await service.overview({
      ...range,
      inquiryReview: {
        version: 1,
        validIds: [10],
        excludedIds: [],
        pendingIds: [11],
      },
    });
    expect(global.operating.inquiries).toEqual({
      raw: 3,
      valid: 1,
      excluded: 0,
      pending: 1,
      unknown: 1,
    });
    // A submission without a matching inquiry record stays unknown even if a different row is valid.
    await event('form_submit', '/zh/inquiry', null, '2026-09-15T02:03:00Z', {
      submissionId: '00000000-0000-4000-8000-000000000004',
    });
    const orphan = await service.overview({
      ...range,
      inquiryReview: {
        version: 1,
        validIds: [10, 13],
        excludedIds: [],
        pendingIds: [11],
      },
    });
    expect(orphan.operating.inquiries).toEqual({
      raw: 4,
      valid: 1,
      excluded: 0,
      pending: 1,
      unknown: 2,
    });
    for (const row of [...orphan.sources, ...orphan.sourceDetails]) {
      expect(row.rawSubmissions).toBe(
        row.validSubmissions! +
          row.pendingSubmissions! +
          row.excludedSubmissions! +
          row.unknownSubmissions!,
      );
      expect(row.validSubmissions).toBeLessThanOrEqual(row.rawSubmissions);
    }
  });

  it('uses the same raw and reviewed source association set when the submission source changes', async () => {
    await event('page_view', articleA, 'cross-source-session', '2026-09-16T01:00:00Z');
    await event('form_submit', '/zh/inquiry', 'cross-source-session', '2026-09-16T01:01:00Z', {
      sourceType: '直接访问',
      sourceDetail: 'typed-in',
      submissionId: '00000000-0000-4000-8000-000000000016',
    });
    await client.query(
      `INSERT INTO "CustomRequirement" VALUES (16, '00000000-0000-4000-8000-000000000016')`,
    );
    const result = await service.overview({
      startDate: '2026-09-16',
      endDate: '2026-09-16',
      inquiryReview: { version: 1, validIds: [16], excludedIds: [], pendingIds: [] },
    });
    expect(result.operating.inquiries.raw).toBe(1);
    expect(result.operating.inquiries.valid).toBe(1);
    expect(result.sources.find((s) => s.sourceType === 'AI引流')).toMatchObject({
      submissions: 0,
      rawSubmissions: 1,
      validSubmissions: 1,
    });
    expect(result.sources.find((s) => s.sourceType === '直接访问')).toMatchObject({
      submissions: 1,
      rawSubmissions: 1,
      validSubmissions: 1,
    });
    for (const row of [...result.sources, ...result.sourceDetails]) {
      expect(row.rawSubmissions).toBe(
        row.validSubmissions! +
          row.pendingSubmissions! +
          row.excludedSubmissions! +
          row.unknownSubmissions!,
      );
      expect(row.validSubmissions).toBeLessThanOrEqual(row.rawSubmissions);
    }
  });

  it('counts contact actions without quote or form intent and deduplicates twenty-second people across real visits', async () => {
    await event('quote_cta_click', articleA, 'quote-only', '2026-09-14T02:00:00Z', {
      visitorId: 'quote-only',
    });
    await event('form_start', articleA, 'form-only', '2026-09-14T02:00:00Z', {
      visitorId: 'form-only',
    });
    await event('dwell_20s', articleB, 'private-session-one', '2026-09-14T01:01:20Z', {
      province: '江苏省',
      regionSource: 'exact_ip',
    });
    await event('dwell_20s', articleB, 'private-session-one', '2026-09-14T01:01:25Z');
    await event('dwell_20s', articleB, 'private-session-two', '2026-09-15T01:00:20Z');
    await event('dwell_20s', articleA, 'private-prior-session', '2026-09-13T16:05:20Z');
    await event('dwell_5s', articleA, 'five-only', '2026-09-14T03:00:00Z', {
      visitorId: 'five-only',
      province: '北京市',
      regionSource: 'exact_ip',
    });
    const result = await service.overview(range);
    expect(result.operating.contactVisitors).toBe(1);
    const a = result.content.pages!.find((p) => p.pagePath === articleA)!;
    const b = result.content.pages!.find((p) => p.pagePath === articleB)!;
    expect(a.contactVisitors).toBe(1);
    expect(a.contacts).toBe(2); // Legacy field stays compatible and includes quote CTA.
    expect([a.dwell20EntryVisitors, b.dwell20EntryVisitors]).toEqual([1, 1]);
    const source = result.sources.find((s) => s.sourceType === 'AI引流')!;
    expect([source.visits, source.dwell20Visitors, source.contactVisitors]).toEqual([3, 1, 1]);
    expect(result.sourceDetails.find((s) => s.sourceDetail === 'chatgpt.com')!.visits).toBe(3);
    expect(result.coverage.region).toMatchObject({
      cohort: 'dwell_20s',
      eligibleVisitors: 1,
      resolvedVisitors: 1,
    });
    expect(result.regions.map((r) => r.province)).toEqual(['江苏省']);
    expect(JSON.stringify(result)).not.toMatch(
      /private-|quote-only|form-only|sessionId|visitorId|00000000-0000|submissionId/,
    );
  });

  it('chooses the earliest non-bot view once even with tied times and a later filtered page', async () => {
    const day = '2026-09-19T01:00:00Z';
    const first = '/zh/news/entry-first';
    const later = '/zh/news/entry-later';
    await event('page_view', first, 'entry-tie', day, { landingPage: first });
    await event('page_view', later, 'entry-tie', day, { landingPage: later });
    await event('page_view', first, 'entry-bot-first', day, {
      landingPage: first,
      userAgent: 'Googlebot',
    });
    await event('page_view', later, 'entry-bot-first', '2026-09-19T01:00:01Z', {
      landingPage: later,
    });
    // The first page remains the entry even when its source is outside the selected filter.
    await event('page_view', first, 'entry-source', day, {
      landingPage: first,
      sourceType: '自然搜索',
      sourceDetail: 'www.baidu.com',
    });
    await event('page_view', later, 'entry-source', '2026-09-19T01:01:00Z', {
      landingPage: later,
    });
    const result = await service.overview({
      startDate: '2026-09-19',
      endDate: '2026-09-19',
      sourceType: 'AI引流',
    });
    expect(result.content.entryVisits).toBe(2);
    expect(result.content.pages!.find((p) => p.pagePath === first)!.entryVisits).toBe(1);
    expect(result.content.pages!.find((p) => p.pagePath === later)!.entryVisits).toBe(1);
    expect(result.content.pages!.reduce((sum, p) => sum + p.entryVisits, 0)).toBe(2);
  });

  it('qualifies twenty-second entries without duplicating visits or accepting earlier and conflicting events', async () => {
    const cases = [
      {
        key: 'repeated',
        entryVisitor: 'reader',
        dwellVisitor: 'reader',
        dwellCount: 2,
        expected: 1,
      },
      { key: 'conflicting', entryVisitor: 'reader', dwellVisitor: 'other', expected: 0 },
      {
        key: 'earlier',
        entryVisitor: 'reader',
        dwellVisitor: 'reader',
        earlier: true,
        expected: 0,
      },
      { key: 'unknown-dwell', entryVisitor: 'reader', dwellVisitor: null, expected: 1 },
      { key: 'unknown-entry', entryVisitor: null, dwellVisitor: 'reader', expected: 1 },
      {
        key: 'other-visit',
        entryVisitor: 'reader',
        dwellVisitor: 'reader',
        otherVisit: true,
        expected: 0,
      },
    ];
    for (const item of cases) {
      const path = `/zh/news/dwell-boundary-${item.key}`;
      const session = `dwell-boundary-${item.key}`;
      await event('page_view', path, session, '2026-09-18T01:00:00Z', {
        landingPage: path,
        visitorId: item.entryVisitor,
      });
      for (let n = 0; n < (item.dwellCount || 1); n++) {
        await event(
          'dwell_20s',
          path,
          item.otherVisit ? `${session}-other` : session,
          item.earlier ? '2026-09-18T00:59:00Z' : '2026-09-18T01:00:20Z',
          {
            landingPage: path,
            visitorId: item.dwellVisitor,
          },
        );
      }
    }
    // One known person returning in another visit remains one person, but two entries.
    const repeatedPath = '/zh/news/dwell-boundary-repeated';
    await event('page_view', repeatedPath, 'returning-visit', '2026-09-18T02:00:00Z', {
      landingPage: repeatedPath,
      visitorId: 'reader',
    });
    await event('dwell_20s', repeatedPath, 'returning-visit', '2026-09-18T02:00:20Z', {
      landingPage: repeatedPath,
      visitorId: 'reader',
    });
    const result = await service.overview({ startDate: '2026-09-18', endDate: '2026-09-18' });
    expect(result.content.entryVisits).toBe(7);
    for (const item of cases) {
      const page = result.content.pages!.find(
        (p) => p.pagePath === `/zh/news/dwell-boundary-${item.key}`,
      )!;
      expect(page.entryVisits).toBe(item.key === 'repeated' ? 2 : 1);
      expect(page.dwell20EntryVisitors).toBe(item.expected);
    }
  });

  it('applies mobile filters to entries, contacts and reviewed cross-page inquiries without creating a midnight entry', async () => {
    const mobile = { deviceType: '移动端', visitorId: 'mobile-person' };
    await event('page_view', articleA, 'mobile-prior', '2026-09-13T15:59:00Z', mobile);
    await event('page_view', articleA, 'mobile-prior', '2026-09-13T16:01:00Z', mobile);
    await event('dwell_20s', articleA, 'mobile-prior', '2026-09-13T16:01:20Z', mobile);
    await event('page_view', articleA, 'mobile-now', '2026-09-14T05:00:00Z', mobile);
    await event('dwell_20s', '/zh/inquiry', 'mobile-now', '2026-09-14T05:00:30Z', mobile);
    await event('phone_click', articleA, 'mobile-now', '2026-09-14T05:00:35Z', mobile);
    await event('form_submit', '/zh/inquiry', 'mobile-now', '2026-09-14T05:01:00Z', {
      ...mobile,
      submissionId: '00000000-0000-4000-8000-000000000005',
    });
    await client.query(
      `INSERT INTO "CustomRequirement" VALUES (15, '00000000-0000-4000-8000-000000000005')`,
    );
    const result = await service.overview({
      ...range,
      device: '移动端',
      pageType: '文章页',
      inquiryReview: {
        version: 1,
        validIds: [10, 15],
        excludedIds: [],
        pendingIds: [],
      },
    });
    expect(result.operating.inquiries).toEqual({
      raw: 1,
      valid: 1,
      excluded: 0,
      pending: 0,
      unknown: 0,
    });
    expect(result.operating.contactVisitors).toBe(1);
    const a = result.content.pages!.find((p) => p.pagePath === articleA)!;
    expect([a.entryVisits, a.dwell20EntryVisitors, a.validCrossPageSubmissions]).toEqual([1, 1, 1]);
    expect(result.sources.find((s) => s.sourceType === 'AI引流')).toMatchObject({
      visits: 2,
      dwell20Visitors: 1,
      contactVisitors: 1,
      validSubmissions: 1,
    });
  });

  it('returns every matching page beyond 200, including the last page with valid engagement and inquiry', async () => {
    const total = 207;
    const paths = Array.from(
      { length: total },
      (_, i) => `/zh/news/all-pages-${String(i + 1).padStart(3, '0')}`,
    );
    for (const [index, path] of paths.entries()) {
      await event('page_view', path, `complete-session-${index}`, '2026-09-17T01:00:00Z', {
        landingPage: path,
        visitorId: `complete-visitor-${index}`,
        deviceType: '移动端',
      });
    }
    const last = paths[total - 1];
    const context = { landingPage: last, visitorId: 'complete-visitor-206', deviceType: '移动端' };
    await event('dwell_20s', last, 'complete-session-206', '2026-09-17T01:00:20Z', context);
    await event('phone_click', last, 'complete-session-206', '2026-09-17T01:00:25Z', context);
    await event('form_submit', last, 'complete-session-206', '2026-09-17T01:01:00Z', {
      ...context,
      submissionId: '00000000-0000-4000-8000-000000000900',
    });
    await client.query(
      `INSERT INTO "CustomRequirement" VALUES (900, '00000000-0000-4000-8000-000000000900')`,
    );
    // Unmatched dimensions must still be excluded after removing the result cap.
    for (const [index, extra] of [
      { pagePath: '/en/news/nonmatching', landingPage: '/en/news/nonmatching' },
      { deviceType: 'PC' },
      { sourceType: '直接访问', sourceDetail: null },
      { pageType: '产品页' },
    ].entries()) {
      await event(
        'page_view',
        '/zh/news/nonmatching',
        `nonmatching-${index}`,
        '2026-09-17T02:00:00Z',
        {
          deviceType: '移动端',
          landingPage: '/zh/news/nonmatching',
          ...extra,
        },
      );
    }
    const result = await service.overview({
      startDate: '2026-09-17',
      endDate: '2026-09-17',
      site: 'zh',
      device: '移动端',
      sourceType: 'AI引流',
      pageType: '文章页',
      inquiryReview: { version: 1, validIds: [900], excludedIds: [], pendingIds: [] },
    });
    const content = result.content;
    expect(content.pageLimit).toBeNull();
    expect(content.pageScope).toBe('all_matching');
    expect(content.totalPages).toBe(total);
    expect(content.pages).toHaveLength(total);
    expect(content.pages!.map((page) => page.pagePath)).toEqual(paths);
    const tail = content.pages![206];
    expect(tail).toMatchObject({
      pagePath: last,
      entryVisits: 1,
      dwell20EntryVisitors: 1,
      contactVisitors: 1,
      validDirectSubmissions: 1,
      validAssociatedSubmissions: 1,
    });
    // The complete response supports title/path search and meaningful sorting of any page.
    expect(content.pages!.filter((page) => page.pagePath.includes('all-pages-207'))).toEqual([
      tail,
    ]);
    expect([...content.pages!].sort((a, b) => b.contactVisitors - a.contactVisitors)[0]).toEqual(
      tail,
    );
    expect(content.pages!.reduce((sum, page) => sum + page.pageViews, 0)).toBe(
      result.funnel.pageViews,
    );
    expect(content.pages!.reduce((sum, page) => sum + page.entryVisits, 0)).toBe(total);
    expect(content.daily!.reduce((sum, day) => sum + day.visits, 0)).toBe(total);
    expect(content.sources!.reduce((sum, source) => sum + source.visits, 0)).toBe(total);
    expect(result.operating.inquiries).toEqual({
      raw: 1,
      valid: 1,
      excluded: 0,
      pending: 0,
      unknown: 0,
    });
  });

  it('excludes marked visits across history while keeping other visits, unknown ids and real submissions', async () => {
    const result = await service.overview(automationRange);
    expect(result.eventCounts.page_view).toEqual({ events: 3, visitors: 3, sessions: 3 });
    expect(result.eventCounts.dwell_20s).toEqual({ events: 1, visitors: 1, sessions: 1 });
    expect(result.eventCounts.phone_click).toEqual({ events: 1, visitors: 1, sessions: 1 });
    expect(result.eventCounts.form_submit).toEqual({ events: 1, visitors: 1, sessions: 1 });
    expect(result.quality.effectiveVisitors).toBe(1);
    expect(result.botFiltered).toEqual(expect.objectContaining({ visitors: 1, events: 1 }));
    expect(
      result.daily.filter((row) => row.eventType === 'page_view').map((row) => row.events),
    ).toEqual([0, 1, 0, 0, 0, 2]);
    expect(result.sources.reduce((total, row) => total + row.pageViews, 0)).toBe(3);
    expect(result.pages.reduce((total, row) => total + row.pageViews, 0)).toBe(3);
    expect(result.content.entryVisits).toBe(1);
    expect(result.content.unidentifiedPageViews).toBe(2);
    expect(result.content.submissions).toBe(1);
    expect(result.content.unlinkedSubmissions).toBe(1);
    expect(
      result.content.pages!.find((row) => row.pagePath === '/zh/inquiry')!.directSubmissions,
    ).toBe(1);
    expect(
      result.content.pages!.some((row) => /marked|property|known-bot/.test(row.pagePath)),
    ).toBe(false);
  });

  it('uses the same session exclusion with date, language, source and content filters', async () => {
    const result = await service.overview({
      ...automationRange,
      site: 'zh',
      sourceType: 'AI引流',
      pageType: '文章页',
    });
    expect(result.eventCounts.page_view.events).toBe(3);
    expect(result.content.entryVisits).toBe(1);
    expect(result.content.pages!.map((row) => row.pagePath).sort()).toEqual([
      '/zh/news/statistics-empty',
      '/zh/news/statistics-null',
      '/zh/news/statistics-real-session',
    ]);
    // Reads made after the successful submission in another visit never recreate attribution.
    expect(result.content.submissions).toBe(0);
  });
});
