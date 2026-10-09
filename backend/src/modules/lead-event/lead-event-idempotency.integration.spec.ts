import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

import { CreateLeadEventDto } from '@/modules/lead-event/dto/create-lead-event.dto';
import { LeadEventService } from '@/modules/lead-event/lead-event.service';
import { PrismaService } from '@/prisma/prisma.service';

jest.mock('@/modules/lead-event/visitor-region', () => ({
  exactIpv4: () => '127.0.0.1',
  resolveVisitorRegion: () => ({ province: null, city: null }),
}));

// Opt-in loopback test. Both connections use a unique disposable schema, never
// the developer's existing analytics table. It is dropped after the test run.
const databaseUrl = process.env.LEAD_EVENT_TEST_DATABASE_URL;
const integration = databaseUrl ? describe : describe.skip;

integration('lead event receipts against PostgreSQL', () => {
  const { Client } = jest.requireActual('pg');
  const testSchema = `lead_event_receipt_test_${randomBytes(8).toString('hex')}`;
  let first: InstanceType<typeof Client>;
  let second: InstanceType<typeof Client>;
  let schemaCreated = false;
  const request = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'Mozilla/5.0 receipt-test' },
  } as Request;
  const packet = (extra: Partial<CreateLeadEventDto> = {}): CreateLeadEventDto => ({
    eventType: 'page_view',
    pagePath: '/zh/news/original',
    sessionId: 'receipt-session',
    visitorId: 'receipt-visitor',
    properties: { collectionId: 'receipt-001' },
    ...extra,
  });

  function adapter(
    client: InstanceType<typeof Client>,
    hooks: { beforeInsert?: () => Promise<void>; lockStarted?: () => void } = {},
  ) {
    type Database = {
      $executeRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<number>;
      $queryRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>;
      $transaction: (
        work: (transaction: Database) => Promise<unknown>,
        options: { isolationLevel: string },
      ) => Promise<unknown>;
    };
    const database: Database = {
      $executeRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
        if (hooks.beforeInsert) await hooks.beforeInsert();
        const sql = Prisma.sql(strings, ...values);
        const result = await client.query(sql.text, sql.values);
        return result.rowCount;
      },
      $queryRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
        const sql = Prisma.sql(strings, ...values);
        const pending = client.query(sql.text, sql.values);
        if (hooks.lockStarted) hooks.lockStarted();
        return (await pending).rows;
      },
      $transaction: async (
        work: (transaction: Database) => Promise<unknown>,
        options: { isolationLevel: string },
      ) => {
        expect(options.isolationLevel).toBe('ReadCommitted');
        await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
        try {
          const result = await work(database);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      },
    };
    return database as unknown as PrismaService;
  }

  const storedRows = async () =>
    (
      await first.query(
        'SELECT "eventType", "sessionId", "pagePath", "properties" FROM "WebsiteLeadEvent"',
      )
    ).rows;

  beforeAll(async () => {
    const target = new URL(databaseUrl!);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) {
      throw new Error('Receipt integration tests require a loopback database');
    }
    first = new Client({ connectionString: databaseUrl });
    second = new Client({ connectionString: databaseUrl });
    await first.connect();
    await second.connect();
    await first.query(`CREATE SCHEMA "${testSchema}"`);
    schemaCreated = true;
    for (const client of [first, second]) {
      await client.query(`SET search_path TO "${testSchema}", pg_catalog`);
    }
    const source = readFileSync(join(__dirname, '../../..', 'prisma/schema.prisma'), 'utf8');
    const model = source.match(/model WebsiteLeadEvent \{([\s\S]*?)\n\}/)![1];
    const types: Record<string, string> = {
      Int: 'integer',
      String: 'text',
      DateTime: 'timestamp',
      Json: 'jsonb',
    };
    const columns = [...model.matchAll(/^\s+(\w+)\s+(Int|String|DateTime|Json)\??\s/gm)].map(
      (match) => `"${match[1]}" ${types[match[2]]}`,
    );
    await first.query(`CREATE TABLE "WebsiteLeadEvent" (${columns.join(',')})`);
    await first.query('CREATE INDEX ON "WebsiteLeadEvent" ("sessionId", "createdAt")');
  });

  beforeEach(async () => {
    await first.query('TRUNCATE "WebsiteLeadEvent"');
  });

  afterAll(async () => {
    try {
      if (schemaCreated) await first.query(`DROP SCHEMA "${testSchema}" CASCADE`);
    } finally {
      if (second) await second.end();
      if (first) await first.end();
    }
  });

  it('acknowledges a lost-response resend while keeping one original record', async () => {
    const service = new LeadEventService(adapter(first));
    expect(await service.createPublic(packet(), request)).toEqual({ ok: true });
    expect(await service.createPublic(packet({ pagePath: '/zh/contact' }), request)).toEqual({
      ok: true,
    });
    expect(await storedRows()).toEqual([
      expect.objectContaining({ pagePath: '/zh/news/original' }),
    ]);
  });

  it('keeps one record when two independent transactions receive the same packet concurrently', async () => {
    let secondStarted!: () => void;
    const secondLockStarted = new Promise<void>((resolve) => {
      secondStarted = resolve;
    });
    const firstService = new LeadEventService(
      adapter(first, {
        beforeInsert: () => secondLockStarted,
      }),
    );
    const secondService = new LeadEventService(adapter(second, { lockStarted: secondStarted }));
    expect(
      await Promise.all([
        firstService.createPublic(packet(), request),
        secondService.createPublic(packet(), request),
      ]),
    ).toEqual([{ ok: true }, { ok: true }]);
    expect(await storedRows()).toHaveLength(1);
  });

  it('keeps a separate visit or event type even when a collection identifier is reused', async () => {
    const service = new LeadEventService(adapter(first));
    await service.createPublic(packet(), request);
    await service.createPublic(packet({ sessionId: 'another-session' }), request);
    await service.createPublic(packet({ eventType: 'dwell_20s' }), request);
    expect(await storedRows()).toHaveLength(3);
  });

  it('preserves the legacy receipt behavior and ignores invalid collection identifiers', async () => {
    const service = new LeadEventService(adapter(first));
    for (const properties of [
      undefined,
      { collectionId: 'invalid identifier' },
      { collectionId: 123 },
    ]) {
      await service.createPublic(packet({ properties }), request);
      await service.createPublic(packet({ properties }), request);
    }
    expect(await storedRows()).toHaveLength(6);
  });

  it.each([undefined, ''])(
    'does not connect unrelated visitors with missing session %p',
    async (sessionId) => {
      const service = new LeadEventService(adapter(first));
      await service.createPublic(packet({ sessionId, visitorId: 'first-visitor' }), request);
      await service.createPublic(packet({ sessionId, visitorId: 'second-visitor' }), request);
      expect(await storedRows()).toHaveLength(2);
    },
  );

  it('deduplicates using the actual sanitized identifiers saved in the record', async () => {
    const service = new LeadEventService(adapter(first));
    await service.createPublic(
      packet({
        sessionId: ' receipt-session ',
        properties: { collectionId: ' receipt-001 ' },
      }),
      request,
    );
    await service.createPublic(packet(), request);
    expect(await storedRows()).toHaveLength(1);
  });

  it('allows another attempt after a failed receipt transaction', async () => {
    let failOnce = true;
    const service = new LeadEventService(
      adapter(first, {
        beforeInsert: async () => {
          if (failOnce) {
            failOnce = false;
            throw new Error('temporary receipt failure');
          }
        },
      }),
    );
    await expect(service.createPublic(packet(), request)).rejects.toThrow(
      'temporary receipt failure',
    );
    expect(await storedRows()).toHaveLength(0);
    expect(await service.createPublic(packet(), request)).toEqual({ ok: true });
    expect(await storedRows()).toHaveLength(1);
  });
});
