import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('inquiry notification state version migration', () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      'prisma/migrations/20260815093000_inquiry_notification_state_version/migration.sql',
    ),
    'utf8',
  );

  it('adds a compatible monotonic state version to existing inquiries', () => {
    expect(migration).toContain('ADD COLUMN "notificationStateVersion" INTEGER NOT NULL DEFAULT 0');
    expect(migration).not.toMatch(/DROP\s+(COLUMN|TABLE)/i);
  });
});
