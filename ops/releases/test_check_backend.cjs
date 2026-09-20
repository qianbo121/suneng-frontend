const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const script = fs.readFileSync(path.join(__dirname, 'check-backend.cjs'), 'utf8');
const pendingName = '20260918160000_website_lead_event_is_bot';

async function check({ pending = true, apply = false, backup = false, brokenHistory = false } = {}) {
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
      if (sql.includes('pg_index')) return [{ indisvalid: true }];
      return migrated ? [{ is_generated: 'ALWAYS' }] : [];
    },
    async $transaction(callback) { return callback({ $executeRawUnsafe: async () => {} }); },
    async $disconnect() { events.push('disconnect'); },
  };
  const proc = { env: { RELEASE_APPLY_INDEX: apply ? '1' : '0', RELEASE_BACKUP_VERIFIED: backup ? '1' : '0' }, execPath: process.execPath };
  const result = vm.runInNewContext(script, {
    require(name) {
      if (name.includes('@prisma/client')) return { PrismaClient: class { constructor() { return client; } } };
      if (name.includes('shuju-growth-read')) return { ShujuGrowthReadService: class { async overview() {
        events.push('aggregate'); if (!migrated) throw Error('isBot column does not exist'); return { content: { status: 'available' } };
      } } };
      if (name === 'node:fs') return { readdirSync: p => fs.readdirSync(path.join(root,p)), existsSync: p => fs.existsSync(path.join(root,p)), readFileSync: p => fs.readFileSync(path.join(root,p)) };
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
