import { readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const migrationSql = readFileSync(
  resolve(process.cwd(), 'prisma/migrations/20260827103000_workpiece_router_context/migration.sql'),
  'utf8',
);

describe('workpiece context forward migration', () => {
  it('adds one nullable inquiry link and a dedicated validated snapshot table', () => {
    expect(migrationSql).toContain('CREATE TABLE "WorkpieceSelection"');
    expect(migrationSql).toContain('"rawConditionsJson" JSONB NOT NULL');
    expect(migrationSql).toContain('"missingInputsJson" JSONB');
    expect(migrationSql).toContain('"publicDirectionIdsJson" JSONB');
    expect(migrationSql).toContain('"ruleVersion" VARCHAR(120) NOT NULL');
    expect(migrationSql).toContain('ADD COLUMN "workpieceSelectionId" INTEGER');
    expect(migrationSql).toContain('ON DELETE SET NULL ON UPDATE CASCADE');
  });

  it('does not rewrite, delete or truncate existing inquiry data', () => {
    expect(migrationSql).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(migrationSql).not.toMatch(/\bTRUNCATE\b/i);
    expect(migrationSql).not.toMatch(/\bDROP\s+(?:TABLE|COLUMN)\b/i);
    expect(migrationSql).not.toMatch(/\bUPDATE\s+"CustomRequirement"\b/i);
  });

  it('keeps WebsiteLeadEvent.properties owned by exactly one forward migration', () => {
    const migrationsRoot = resolve(process.cwd(), 'prisma/migrations');
    const owners = readdirSync(migrationsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        migration: entry.name,
        sql: readFileSync(join(migrationsRoot, entry.name, 'migration.sql'), 'utf8'),
      }))
      .filter(({ sql }) =>
        /ALTER TABLE "WebsiteLeadEvent"[\s\S]*?ADD COLUMN "properties" JSONB/i.test(sql),
      )
      .map(({ migration }) => migration);

    expect(owners).toEqual(['20260827103000_workpiece_router_context']);
  });
});
