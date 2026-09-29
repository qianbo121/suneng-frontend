const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const script = fs.readFileSync(path.join(__dirname, 'check-backend.cjs'), 'utf8');
const CONTACT_MIGRATION = '20260929160000_align_minimal_inquiry_contact_limits';

async function check({ pending = true, apply = false, backup = false, brokenHistory = false, noMigrations = false, index = true, botColumn = true, contactLimits = true, pendingName = '20260918160000_website_lead_event_is_bot', tampered = false } = {}) {
  const events = [];
  let migrated = !pending;
  let report;
  const history = fs.readdirSync(path.join(root, 'backend/prisma/migrations')).filter(name =>
    fs.existsSync(path.join(root, 'backend/prisma/migrations', name, 'migration.sql')) && (!pending || name !== pendingName)).map(name => ({
      migration_name: name, finished_at: '2026-09-19', rolled_back_at: null,
      checksum: brokenHistory ? 'bad' : crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'backend/prisma/migrations', name, 'migration.sql'))).digest('hex'),
    }));
  const client = {
    async $queryRawUnsafe(sql) {
      if (sql.includes('_prisma_migrations')) { events.push('history'); return history; }
      if (sql.includes("table_name='CustomRequirement'")) return [{ column_name: 'name', character_maximum_length: contactLimits ? 180 : 120 }, { column_name: 'phone', character_maximum_length: contactLimits ? 254 : 50 }];
      if (sql.includes('pg_index')) return [{ indisvalid: index }];
      return migrated && botColumn ? [{ is_generated: 'ALWAYS' }] : [];
    },
    async $transaction(callback) { return callback({ $executeRawUnsafe: async () => {} }); },
    async $disconnect() { events.push('disconnect'); },
  };
  const proc = { env: { RELEASE_NO_MIGRATIONS: noMigrations ? '1' : '0', RELEASE_APPLY_INDEX: apply ? '1' : '0', RELEASE_BACKUP_VERIFIED: backup ? '1' : '0' }, execPath: process.execPath };
  const result = vm.runInNewContext(script, {
    require(name) {
      if (name.includes('@prisma/client')) return { PrismaClient: class { constructor() { return client; } } };
      if (name.includes('shuju-growth-read')) return { ShujuGrowthReadService: class { async overview() {
        events.push('aggregate'); if (!migrated) throw Error('isBot column does not exist'); return { content: { status: 'available' } };
      } } };
      if (name === 'node:fs') return { readdirSync: p => fs.readdirSync(path.join(root,p)), existsSync: p => fs.existsSync(path.join(root,p)), readFileSync: p => tampered && p.includes(CONTACT_MIGRATION) ? Buffer.from('ALTER TABLE unexpected;') : fs.readFileSync(path.join(root,p)) };
      if (name === 'node:child_process') return { execFileSync() { events.push('migrate'); migrated = true; } };
      return require(name);
    }, process: proc, console: { log: value => { report = JSON.parse(value); }, error() {} }, Date,
  });
  await result;
  return { events, report, failed: proc.exitCode === 1 };
}
test('preflight verifies migration history but never queries a missing new column', async () => {
  const result = await check(); assert.equal(result.failed,false); assert.equal(result.report.aggregateDeferred,true);
  assert.ok(!result.events.includes('aggregate')); assert.ok(!result.events.includes('migrate'));
});
test('apply migrates only after backup authorization and before the new aggregate', async () => {
  const result = await check({ apply:true, backup:true }); assert.equal(result.failed,false);
  assert.ok(result.events.indexOf('migrate') < result.events.indexOf('aggregate')); assert.equal(result.report.aggregateAvailable,true);
});
test('a missing backup refuses migration and new-schema reads', async () => {
  const result = await check({ apply:true }); assert.equal(result.failed,true);
  assert.ok(!result.events.includes('migrate')); assert.ok(!result.events.includes('aggregate'));
});
test('unchanged schema still runs the real aggregate verification stage', async () => {
  const result = await check({ pending:false }); assert.equal(result.failed,false); assert.equal(result.report.aggregateAvailable,true);
  assert.ok(result.events.includes('aggregate')); assert.ok(!result.events.includes('migrate'));
});
test('unreconciled history blocks all later steps', async () => {
  const result = await check({ brokenHistory:true, apply:true, backup:true }); assert.equal(result.failed,true);
  assert.ok(!result.events.includes('migrate')); assert.ok(!result.events.includes('aggregate'));
});

test('backend-only refuses even approved pending migrations before aggregate or mutation', async () => {
  for (const apply of [false, true]) {
    const result = await check({ noMigrations:true, apply, backup:true });
    assert.equal(result.failed,true);
    assert.ok(!result.events.includes('aggregate')); assert.ok(!result.events.includes('migrate'));
  }
});
test('backend-only verifies unchanged schema and rejects missing index or bot column', async () => {
  const good = await check({ pending:false, noMigrations:true });
  assert.equal(good.failed,false); assert.equal(good.report.pendingMigrationCount,0);
  assert.equal(good.report.aggregateAvailable,true); assert.ok(!good.events.includes('migrate'));
  for (const missing of [{index:false}, {botColumn:false}]) {
    const result = await check({ pending:false, noMigrations:true, ...missing });
    assert.equal(result.failed,true); assert.ok(!result.events.includes('migrate'));
  }
});

test('contact widening is pinned, backup-gated, and verifies the final capacity', async () => {
  const good = await check({ pendingName: CONTACT_MIGRATION, apply:true, backup:true });
  assert.equal(good.failed,false); assert.equal(good.report.contactLimitsMatch,true);
  for (const change of [{ backup:false }, { tampered:true }]) {
    const bad = await check({ pendingName: CONTACT_MIGRATION, apply:true, backup:true, ...change });
    assert.equal(bad.failed,true); assert.ok(!bad.events.includes('migrate'));
  }
  const stale = await check({ pending:false, contactLimits:false });
  assert.equal(stale.failed,true);
});
