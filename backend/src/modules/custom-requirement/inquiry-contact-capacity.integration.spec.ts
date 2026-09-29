import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const databaseUrl = process.env.CONTENT_GROWTH_TEST_DATABASE_URL;
const integration = databaseUrl ? describe : describe.skip;

integration('inquiry contact widening against PostgreSQL', () => {
  const { Client } = jest.requireActual('pg');
  let client: InstanceType<typeof Client>;

  beforeAll(async () => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(databaseUrl!).hostname)) {
      throw new Error('Inquiry integration tests require a loopback test database');
    }
    client = new Client({ connectionString: databaseUrl });
    await client.connect();
    // A connection-local table shadows the real relation. Never migrate or insert
    // into the developer's persistent database, and never start notification jobs.
    await client.query(
      'CREATE TEMP TABLE "CustomRequirement" (id integer PRIMARY KEY, name varchar(120), phone varchar(50) NOT NULL)',
    );
    await client.query('INSERT INTO pg_temp."CustomRequirement" VALUES (1, $1, $2)', [
      'Existing inquiry',
      '13800138000',
    ]);
  });

  afterAll(async () => {
    await client?.end();
  });

  it('preserves old records and accepts the full contract while keeping phone required', async () => {
    await client.query(
      readFileSync(
        resolve(
          process.cwd(),
          'prisma/migrations/20260929160000_align_minimal_inquiry_contact_limits/migration.sql',
        ),
        'utf8',
      ),
    );
    const old = await client.query('SELECT * FROM pg_temp."CustomRequirement" WHERE id=1');
    expect(old.rows).toEqual([{ id: 1, name: 'Existing inquiry', phone: '13800138000' }]);
    const identity = '王'.repeat(180);
    const contact = '1'.repeat(254);
    await client.query('INSERT INTO pg_temp."CustomRequirement" VALUES (2, $1, $2)', [
      identity,
      contact,
    ]);
    const saved = await client.query('SELECT * FROM pg_temp."CustomRequirement" WHERE id=2');
    expect(saved.rows).toEqual([{ id: 2, name: identity, phone: contact }]);
    await expect(
      client.query('INSERT INTO pg_temp."CustomRequirement" VALUES (3, $1, NULL)', ['Missing']),
    ).rejects.toMatchObject({ code: '23502' });
    await expect(
      client.query('INSERT INTO pg_temp."CustomRequirement" VALUES (4, $1, $2)', [
        'Too long',
        '1'.repeat(255),
      ]),
    ).rejects.toMatchObject({ code: '22001' });
  });
});
