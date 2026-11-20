const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const script = fs.readFileSync(path.join(__dirname, 'check-backend.cjs'), 'utf8');
const CONTACT_MIGRATION = '20260929160000_align_minimal_inquiry_contact_limits';

const STRIP = '20261115032000_anonymize_strip_case_news';
const OLD_IMAGE = 'sha256:b0f6e603202af4c948607bffca2dd14fb4bdfe79fa55cd0e570158864a475eb7';
async function check({ missingFile, image, historyChanges, pending = true, apply = false, backup = false, brokenHistory = false, noMigrations = false, index = true, botColumn = true, contactLimits = true, pendingName = '20260918160000_website_lead_event_is_bot', tampered = false } = {}) {
  const events = [];
  let migrated = !pending;
  let report;
  const history = fs.readdirSync(path.join(root, 'backend/prisma/migrations')).filter(name =>
    fs.existsSync(path.join(root, 'backend/prisma/migrations', name, 'migration.sql')) && (!pending || name !== pendingName)).map(name => ({
      migration_name: name, finished_at: '2026-09-19', rolled_back_at: null,
      checksum: brokenHistory ? 'bad' : crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'backend/prisma/migrations', name, 'migration.sql'))).digest('hex'),
    }));
  if (historyChanges) historyChanges(history);
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
  const proc = { env: { RELEASE_VERIFIED_BACKEND_IMAGE: image, RELEASE_NO_MIGRATIONS: noMigrations ? '1' : '0', RELEASE_APPLY_INDEX: apply ? '1' : '0', RELEASE_BACKUP_VERIFIED: backup ? '1' : '0' }, execPath: process.execPath };
  const result = vm.runInNewContext(script, {
    require(name) {
      if (name.includes('@prisma/client')) return { PrismaClient: class { constructor() { return client; } } };
      if (name.includes('shuju-growth-read')) return { ShujuGrowthReadService: class { async overview() {
        events.push('aggregate'); if (!migrated) throw Error('isBot column does not exist'); return { content: { status: 'available' } };
      } } };
      if (name === 'node:fs') return { readdirSync: p => fs.readdirSync(path.join(root,p)).filter(name => name !== missingFile), existsSync: p => fs.existsSync(path.join(root,p)), readFileSync: p => tampered && p.includes(CONTACT_MIGRATION) ? Buffer.from('ALTER TABLE unexpected;') : fs.readFileSync(path.join(root,p)) };
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

test('old backend recognizes exactly one finished reviewed article record in read-only mode', async () => {
  const exact = { noMigrations: true, pending: false, image: OLD_IMAGE, missingFile: STRIP };
  const ok = await check(exact);
  assert.equal(ok.failed, false);
  assert.equal(ok.report.verifiedHistoricalDataChange, true);
  assert.equal(ok.report.pendingMigrationCount, 0);
  assert.equal(ok.report.aggregateAvailable, true);
  for (const change of [
    { image: undefined }, { image: 'sha256:' + 'a'.repeat(64) },
    { apply: true }, { noMigrations: false }, { pending: true },
    { missingFile: CONTACT_MIGRATION },
    { historyChanges: rows => { rows.find(r => r.migration_name === STRIP).checksum = 'bad'; } },
    { historyChanges: rows => { rows.find(r => r.migration_name === STRIP).finished_at = null; } },
    { historyChanges: rows => { rows.push(rows.find(r => r.migration_name === STRIP)); } },
  ]) {
    const blocked = await check({ ...exact, ...change });
    assert.equal(blocked.failed, true);
    assert.ok(!blocked.events.includes('migrate'));
    assert.ok(!blocked.events.includes('aggregate'));
  }
});
