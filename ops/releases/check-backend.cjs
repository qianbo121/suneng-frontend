// Bounded release check. Does not bootstrap Nest or its notification processor.
const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const { ShujuGrowthReadService } = require('./backend/dist/src/modules/shuju-service/shuju-growth-read.service');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const prisma = new PrismaClient();
// Migrations this release may apply, each pinned to the reviewed source it was checked as.
// A pending migration that is not listed here, or whose file no longer hashes to the pinned
// value, stops the release. Add an entry only for a migration that has been reviewed.
const ALLOWED_PENDING = new Map([
  ['20260915103000_content_growth_session_index', '93b3973b671f12b3ed17dc5c91e9162b06b63e278f7d3f2af01fed6156b8aa88'],
  ['20260918160000_website_lead_event_is_bot', '2ed71856eddb253f4f96f42daad5dc76b901e6c4984a446615d8c12df6fc7b2d'],
]);
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
  for (const name of pending) {
    const reviewed = ALLOWED_PENDING.get(name);
    if (!reviewed) throw new Error('Unexpected pending migration');
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name, 'migration.sql'))).digest('hex');
    if (digest !== reviewed) throw new Error('Pending migration differs from reviewed source');
  }
  const applying = process.env.RELEASE_APPLY_INDEX === '1';
  if (pending.length && !applying) {
    // New queries cannot run on the old schema. History/hash checks above are
    // still mandatory; defer the aggregate until the reviewed migration exists.
    console.log(JSON.stringify({passed:true,pendingMigrationCount:pending.length,
      aggregateAvailable:null,aggregateDeferred:true,dataRestored:false,notificationsSent:false}));
    return;
  }
  if (pending.length) {
    if (process.env.RELEASE_BACKUP_VERIFIED !== '1') throw new Error('Verified backup required before migration');
    cp.execFileSync(process.execPath, ['backend/node_modules/prisma/build/index.js','migrate','deploy','--schema','backend/prisma/schema.prisma'], {timeout:60000, stdio:'pipe'});
  }
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
  const index = await prisma.$queryRawUnsafe(`SELECT i.indisvalid FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE c.relname='WebsiteLeadEvent_sessionId_createdAt_idx'`);
  if (process.env.RELEASE_APPLY_INDEX === '1' && !index.some(x=>x.indisvalid)) throw new Error('Index is not valid');
  // The aggregates above filter on "isBot"; a missing or unpopulated column would silently
  // change every visitor number rather than fail, so confirm it is really there and stored.
  const botColumn = await prisma.$queryRawUnsafe(`SELECT is_generated FROM information_schema.columns WHERE table_name='WebsiteLeadEvent' AND column_name='isBot'`);
  const botColumnStored = botColumn.some(x => x.is_generated === 'ALWAYS');
  if (process.env.RELEASE_APPLY_INDEX === '1' && !botColumnStored) throw new Error('Bot column is missing or not generated');
  console.log(JSON.stringify({passed:true,pendingMigrationCount:pending.length,indexPresent:index.some(x=>x.indisvalid),botColumnStored,aggregateAvailable:true,aggregateCheckMs:Date.now()-began,dataRestored:false,notificationsSent:false}));
})().catch(() => { console.error('Backend release check failed; no customer data is printed.');process.exitCode=1; }).finally(()=>prisma.$disconnect());
