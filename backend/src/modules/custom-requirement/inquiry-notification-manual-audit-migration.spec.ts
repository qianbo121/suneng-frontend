import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('inquiry notification manual audit migration', () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      'prisma/migrations/20260814232000_inquiry_notification_manual_audit/migration.sql',
    ),
    'utf8',
  );

  it('creates an append-only audit shape with operator, transition, note and timestamp', () => {
    expect(migration).toContain('CREATE TABLE "InquiryNotificationAudit"');
    expect(migration).toContain('"operatorAdminUserId" INTEGER NOT NULL');
    expect(migration).toContain('"operatorUsername" VARCHAR(80) NOT NULL');
    expect(migration).toContain('"operatorRole" "AdminRole" NOT NULL');
    expect(migration).toContain("'requeue_failed'");
    expect(migration).toContain("'confirm_unknown_delivered'");
    expect(migration).toContain("'confirm_unknown_not_delivered_and_requeue'");
    expect(migration).toContain('"previousStatus" "InquiryNotificationStatus" NOT NULL');
    expect(migration).toContain('"nextStatus" "InquiryNotificationStatus" NOT NULL');
    expect(migration).toContain('"note" VARCHAR(1000) NOT NULL');
    expect(migration).toContain('"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP');
    expect(migration).not.toMatch(/UPDATE\s+"InquiryNotificationAudit"/);
    expect(migration).not.toMatch(/DELETE\s+FROM\s+"InquiryNotificationAudit"/);
  });

  it('protects audit history from inquiry deletion', () => {
    expect(migration).toContain('"InquiryNotificationAudit_customRequirementId_fkey"');
    expect(migration).toContain('ON DELETE RESTRICT ON UPDATE CASCADE');
  });
});
