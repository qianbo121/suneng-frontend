// Bounded release check. Does not bootstrap Nest or its notification processor.
const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const { ShujuGrowthReadService } = require('./backend/dist/src/modules/shuju-service/shuju-growth-read.service');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const prisma = new PrismaClient();
const INDEX_MIGRATION = '20260915103000_content_growth_session_index';
const INDEX_HASH = '93b3973b671f12b3ed17dc5c91e9162b06b63e278f7d3f2af01fed6156b8aa88';
(async () => {
  const root = 'backend/prisma/migrations';
  const migrations = fs.readdirSync(root).filter(n => fs.existsSync(path.join(root, n, 'migration.sql')));
  const applied = await prisma.$queryRawUnsafe('SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations"');
  for (const row of applied) {
    if (row.rolled_back_at) continue;
    if (!row.finished_at || !migrations.includes(row.migration_name)) throw new Error('Migration history requires reconciliation');
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, row.migration_name, 'migration.sql'))).digest('hex');
    if (digest !== row.checksum) throw new Error('Applied migration differs from reviewed source');
  }
  const done = new Set(applied.filter(x => x.finished_at && !x.rolled_back_at).map(x => x.migration_name));
  const pending = migrations.filter(x => !done.has(x));
  if (pending.some(x => x !== INDEX_MIGRATION)) throw new Error('Unexpected pending migration');
  if (crypto.createHash('sha256').update(fs.readFileSync(path.join(root, INDEX_MIGRATION, 'migration.sql'))).digest('hex') !== INDEX_HASH) throw new Error('Index migration changed');
  const end = new Date().toISOString().slice(0,10);
  const start = new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const began = Date.now();
  // Enforce read-only statements and a timeout on the connection used for verification.
  const aggregate = await prisma.$transaction(async tx => {
    await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '20s'");
    await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    return new ShujuGrowthReadService(tx).overview({ startDate:start, endDate:end });
  }, { timeout:30000 });
  if (aggregate.content?.status !== 'available') throw new Error('Content aggregate unavailable');
  if (process.env.RELEASE_APPLY_INDEX === '1' && pending.length) {
    // Only the previously checked, additive index is pending. No reset, seed or restore.
    cp.execFileSync(process.execPath, ['backend/node_modules/prisma/build/index.js','migrate','deploy','--schema','backend/prisma/schema.prisma'], {timeout:60000, stdio:'pipe'});
  }
  const index = await prisma.$queryRawUnsafe(`SELECT i.indisvalid FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE c.relname='WebsiteLeadEvent_sessionId_createdAt_idx'`);
  if (process.env.RELEASE_APPLY_INDEX === '1' && !index.some(x=>x.indisvalid)) throw new Error('Index is not valid');
  console.log(JSON.stringify({passed:true,pendingMigrationCount:pending.length,indexPresent:index.some(x=>x.indisvalid),aggregateAvailable:true,aggregateCheckMs:Date.now()-began,dataRestored:false,notificationsSent:false}));
})().catch(() => { console.error('Backend release check failed; no customer data is printed.');process.exitCode=1; }).finally(()=>prisma.$disconnect());
