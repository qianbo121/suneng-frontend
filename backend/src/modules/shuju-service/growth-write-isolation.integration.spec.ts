import { randomBytes } from 'node:crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { GrowthReadProtection } from './growth-read-protection';

const url = process.env.GROWTH_ISOLATION_TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;

integration('report burst versus live-write capacity on isolated PostgreSQL', () => {
  const { Client } = jest.requireActual('pg');
  const schema = `growth_capacity_test_${randomBytes(8).toString('hex')}`;
  let observer: InstanceType<typeof Client>;
  let database: PrismaService;
  let created = false;

  beforeAll(async () => {
    const target = new URL(url!);
    if (target.hostname !== '127.0.0.1' || target.pathname !== '/geo_timeout_test') {
      throw new Error('Capacity test requires its disposable loopback database');
    }
    observer = new Client({ connectionString: target.toString() });
    await observer.connect();
    await observer.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    await observer.query(`CREATE TABLE "${schema}"."CapacityProbe" (id integer PRIMARY KEY)`);
    target.searchParams.set('schema', schema);
    target.searchParams.set('connection_limit', '3');
    database = new PrismaService({ datasources: { db: { url: target.toString() } } });
    await database.$connect();
  });

  afterAll(async () => {
    await database?.$disconnect();
    if (created) await observer.query(`DROP SCHEMA "${schema}" CASCADE`);
    await observer?.end();
  });

  async function waitForSleepingReads(expected: number) {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const { rows } = await observer.query(
        "SELECT COUNT(*)::int AS n FROM pg_stat_activity WHERE datname=current_database() AND wait_event='PgSleep'",
      );
      if (rows[0].n === expected) return;
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    throw new Error(`Expected ${expected} concurrent test reads`);
  }

  it('reproduces pool starvation without admission and preserves writes with protection', async () => {
    // Accelerated, controlled fault injection, not a production throughput SLA.
    const unprotected = Promise.all(
      Array.from({ length: 8 }, () => database.$queryRaw`SELECT pg_sleep(1)::text AS waited`),
    );
    try {
      await waitForSleepingReads(3);
      await expect(
        database.$transaction(
          async (tx) => tx.$executeRaw`INSERT INTO "CapacityProbe" (id) VALUES (1)`,
          { maxWait: 200, timeout: 1000 },
        ),
      ).rejects.toMatchObject({ code: 'P2028' });
    } finally {
      await unprotected;
    }
    const protectedRead = new GrowthReadProtection().database(database);
    const protectedBurst = Promise.all(
      Array.from({ length: 8 }, () => protectedRead.$queryRaw`SELECT pg_sleep(1)::text AS waited`),
    );
    try {
      await waitForSleepingReads(2);
      await expect(
        database.$transaction(
          async (tx) => tx.$executeRaw`INSERT INTO "CapacityProbe" (id) VALUES (2)`,
          { maxWait: 200, timeout: 1000 },
        ),
      ).resolves.toBe(1);
    } finally {
      await protectedBurst;
    }
    const stored = await database.$queryRaw<Array<{ id: number }>>`SELECT id FROM "CapacityProbe"`;
    expect(stored).toEqual([{ id: 2 }]);
  }, 20_000);
});
