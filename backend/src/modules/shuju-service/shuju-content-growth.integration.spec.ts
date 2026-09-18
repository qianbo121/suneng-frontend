import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';

// Opt-in local PostgreSQL contract test. All inserts go into a connection-local temp table.
const databaseUrl = process.env.CONTENT_GROWTH_TEST_DATABASE_URL;
const integration = databaseUrl ? describe : describe.skip;

integration('content growth against PostgreSQL', () => {
  const { Client } = jest.requireActual('pg');
  let client: InstanceType<typeof Client>;
  let service: ShujuGrowthReadService;
  const range = { startDate: '2026-09-14', endDate: '2026-09-15' };
  const articleA = '/zh/news/acceptance';
  const articleB = '/zh/news/energy';
  let nextId = 1;

  beforeAll(async () => {
    const target = new URL(databaseUrl!);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) {
      throw new Error('Content integration tests require a loopback database');
    }
    client = new Client({ connectionString: databaseUrl });
    await client.connect();
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
      (match) => `"${match[1]}" ${types[match[2]]}`,
    );
    await client.query(`CREATE TEMP TABLE "WebsiteLeadEvent" (${columns.join(',')})`);
    await client.query('CREATE INDEX ON "WebsiteLeadEvent" ("sessionId", "createdAt")');
    // The bot flag is a generated column, so Prisma's schema does not describe it and the
    // loop above cannot derive it. Run the migration itself against the temp table (which
    // shadows the real one) rather than restating the definition, so this test can never
    // drift from what production computes.
    await client.query(
      readFileSync(
        join(
          __dirname,
          '../../..',
          'prisma/migrations/20260918160000_website_lead_event_is_bot/migration.sql',
        ),
        'utf8',
      ),
    );
    const event = async (
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
    service = new ShujuGrowthReadService({
      $queryRaw: (sql: { text: string; values: unknown[] }) =>
        client.query(sql.text, sql.values).then((result: { rows: unknown[] }) => result.rows),
    } as unknown as PrismaService);
  });

  afterAll(async () => {
    if (client) await client.end();
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
});
