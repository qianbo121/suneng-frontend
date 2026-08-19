/**
 * 给历史埋点补上客户所在地。
 *
 * 地区是从已经存下来的脱敏 IP（114.252.xxx.xxx）推出来的，
 * 不新增任何采集，也不还原真实 IP——后两段本来就没存过。
 *
 * 默认只看不写。确认无误后加 --apply 才真正落库。
 *
 *   pnpm --dir backend exec ts-node scripts/backfill-visitor-region.ts
 *   pnpm --dir backend exec ts-node scripts/backfill-visitor-region.ts --apply
 */
import { PrismaClient } from '@prisma/client';

import { resolveVisitorRegion } from '../src/modules/lead-event/visitor-region';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

async function main() {
  // 一个网段对应一个地区，按网段查一次就够，不必逐条查 1000 次
  const prefixes = await prisma.$queryRaw<{ ipMasked: string; rows: bigint }[]>`
    SELECT "ipMasked", COUNT(*)::bigint AS rows
    FROM "WebsiteLeadEvent"
    WHERE "ipMasked" IS NOT NULL AND "province" IS NULL
    GROUP BY "ipMasked"
    ORDER BY rows DESC
  `;

  let resolved = 0;
  let unresolved = 0;
  let affected = 0;
  const byProvince = new Map<string, number>();

  for (const row of prefixes) {
    const region = resolveVisitorRegion(row.ipMasked);
    const count = Number(row.rows);
    if (!region.province) {
      unresolved += count;
      continue;
    }
    resolved += count;
    byProvince.set(region.province, (byProvince.get(region.province) ?? 0) + count);
    if (apply) {
      // 只补空的，不覆盖已有值——重复执行安全
      affected += await prisma.$executeRaw`
        UPDATE "WebsiteLeadEvent"
        SET "province" = ${region.province}, "city" = ${region.city}
        WHERE "ipMasked" = ${row.ipMasked} AND "province" IS NULL
      `;
    }
  }

  const total = resolved + unresolved;
  console.log(`网段 ${prefixes.length} 个，涉及记录 ${total} 条`);
  console.log(
    `  能定位   ${resolved} 条 (${total ? ((resolved / total) * 100).toFixed(1) : '0.0'}%)`,
  );
  console.log(`  定不出来 ${unresolved} 条`);
  console.log('\n省份分布:');
  [...byProvince.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([province, count]) => console.log(`  ${province.padEnd(10)} ${count}`));
  console.log(
    apply ? `\n已写入 ${affected} 条。` : '\n这是预演，一个字节都没改。加 --apply 才会写库。',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
