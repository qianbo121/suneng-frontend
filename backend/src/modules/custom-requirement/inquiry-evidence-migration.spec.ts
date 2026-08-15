import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const backendRoot = process.cwd();

describe('inquiry evidence migration', () => {
  const migration = readFileSync(
    resolve(
      backendRoot,
      'prisma/migrations/20260814083000_inquiry_submission_evidence_chain/migration.sql',
    ),
    'utf8',
  );
  const schema = readFileSync(resolve(backendRoot, 'prisma/schema.prisma'), 'utf8');

  it('gives old and existing writes a database UUID without prematurely requiring the column', () => {
    const defaultAt = migration.indexOf('"submissionId" UUID DEFAULT gen_random_uuid()');
    const uniqueAt = migration.indexOf('CREATE UNIQUE INDEX "CustomRequirement_submissionId_key"');

    expect(defaultAt).toBeGreaterThan(-1);
    expect(uniqueAt).toBeGreaterThan(defaultAt);
    expect(migration).not.toContain('ALTER COLUMN "submissionId" SET NOT NULL');
  });

  it('preserves legacy columns and the old backend non-null phone contract', () => {
    expect(migration).not.toMatch(/DROP COLUMN/);
    expect(migration).not.toContain('ALTER COLUMN "phone" DROP NOT NULL');
    expect(schema).toMatch(/phone\s+String\s+@db\.VarChar\(50\)/);
    expect(migration).toContain(`"notificationStatus" = 'legacy_unknown'`);
    expect(migration).toContain('"CustomRequirement_clientIdempotencyKey_key"');
    expect(migration).toContain('"CustomRequirement_notification_due_idx"');
    expect(schema).toContain('map: "CustomRequirement_notification_due_idx"');
    expect(migration).toContain('ALTER COLUMN "notificationStatus" SET DEFAULT \'legacy_unknown\'');
    expect(schema).toMatch(
      /notificationStatus\s+InquiryNotificationStatus\s+@default\(legacy_unknown\)/,
    );
  });

  it('adds a database-level link from the form event to the inquiry submission id', () => {
    expect(migration).toContain('"WebsiteLeadEvent_submissionId_fkey"');
    expect(migration).toContain(
      'FOREIGN KEY ("submissionId") REFERENCES "CustomRequirement"("submissionId")',
    );
  });
});
