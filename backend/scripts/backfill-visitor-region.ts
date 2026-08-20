/**
 * 给历史埋点补上客户所在地。
 *
 * 历史数据只有脱敏 IP（114.252.xxx.xxx）。本脚本不再固定补 `.0.1`
 * 猜省份，只回填整个 /16 抽样稳定的网段；跨省网段清为未知。
 *
 * 默认只看不写。确认无误后加 --apply 才真正落库。
 *
 *   pnpm --dir backend exec ts-node scripts/backfill-visitor-region.ts
 *   pnpm --dir backend exec ts-node scripts/backfill-visitor-region.ts --apply --before=2026-08-20T10:00:00Z
 */
import { PrismaClient } from '@prisma/client';

import { resolveStableMaskedRegion } from '../src/modules/lead-event/visitor-region';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');
const beforeText = process.argv.find((value) => value.startsWith('--before='))?.slice('--before='.length);
const beforeDate = beforeText ? new Date(beforeText) : null;

if (beforeDate && Number.isNaN(beforeDate.getTime())) {
  throw new Error('--before 必须是有效日期');
}
if (apply && !beforeDate) {
  throw new Error('--apply 必须同时给出 --before，避免覆盖新版本的精确地区');
}
// createdAt 是「不带时区但内容按 UTC 存」；显式变成 UTC 墙上时间字符串，
// 不让数据库连接自身的时区把切点再换算一次。
const beforeUtc = beforeDate?.toISOString().slice(0, 19).replace('T', ' ') ?? null;

async function main() {
  // 按网段检查一次。旧的错误回填也要纳入，不再只看 province IS NULL。
  const prefixes = await prisma.$queryRaw<{ ipMasked: string; rows: bigint }[]>`
    SELECT "ipMasked", COUNT(*)::bigint AS rows
    FROM "WebsiteLeadEvent"
    WHERE "ipMasked" IS NOT NULL
      AND (${beforeUtc}::timestamp IS NULL OR "createdAt" < ${beforeUtc}::timestamp)
    GROUP BY "ipMasked"
    ORDER BY rows DESC
  `;

  let resolved = 0;
  let unresolved = 0;
  let affected = 0;
  const byProvince = new Map<string, number>();

  for (const row of prefixes) {
    const region = resolveStableMaskedRegion(row.ipMasked);
    const count = Number(row.rows);
    if (!region.province) {
      unresolved += count;
      if (apply) {
        // 不稳定网段必须撤回旧版猜出的省市，不让错地区继续上看板。
        affected += await prisma.$executeRaw`
          UPDATE "WebsiteLeadEvent"
          SET "province" = NULL, "city" = NULL, "regionSource" = NULL
          WHERE "ipMasked" = ${row.ipMasked} AND "createdAt" < ${beforeUtc}::timestamp
        `;
      }
      continue;
    }
    resolved += count;
    byProvince.set(region.province, (byProvince.get(region.province) ?? 0) + count);
    if (apply) {
      // 只处理上线切点前的旧数据，不覆盖新版精确解析。
      affected += await prisma.$executeRaw`
        UPDATE "WebsiteLeadEvent"
        SET "province" = ${region.province}, "city" = ${region.city},
            "regionSource" = 'stable_masked_prefix'
        WHERE "ipMasked" = ${row.ipMasked} AND "createdAt" < ${beforeUtc}::timestamp
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
  console.log(apply ? `\n已校正 ${affected} 条。` : '\n这是预演，一个字节都没改。');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
