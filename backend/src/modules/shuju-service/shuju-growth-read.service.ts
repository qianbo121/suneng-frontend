import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ShujuGrowthReadQueryDto } from '@/modules/shuju-service/dto/shuju-growth-read-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

type CountRow = {
  eventType: string;
  eventCount: bigint;
  visitorCount: bigint;
  sessionCount: bigint;
};
export type DailyRow = { day: string; eventType: string; eventCount: bigint; visitorCount: bigint };
type SourceRow = {
  sourceType: string | null;
  sourceDetail: string | null;
  visitors: bigint;
  pageViews: bigint;
  engagedVisitors: bigint;
  highIntentVisitors: bigint;
  formStarts: bigint;
  stepCompleted: bigint;
  submissions: bigint;
};
type PageRow = {
  pagePath: string | null;
  pageTitle: string | null;
  pageType: string | null;
  productTag: string | null;
  visitors: bigint;
  pageViews: bigint;
  engagedVisitors: bigint;
  highIntentVisitors: bigint;
  formStarts: bigint;
  stepCompleted: bigint;
  submissions: bigint;
};
type LandingRow = {
  landingPage: string | null;
  visitors: bigint;
  sessions: bigint;
  pageViews: bigint;
};

type ExitRow = {
  pagePath: string | null;
  sessions: bigint;
};

type RegionRow = {
  province: string | null;
  visitors: bigint;
  sessions: bigint;
  engagedVisitors: bigint;
  highIntentVisitors: bigint;
};
type RegionCoverageRow = { eligibleVisitors: bigint; resolvedVisitors: bigint };
type DimensionCoverageRow = {
  unknownDeviceSubmissions: bigint;
  unknownRegionSubmissions: bigint;
};
type SegmentRow = {
  day: string;
  eventType: string;
  pagePath: string | null;
  pageTitle: string | null;
  pageType: string | null;
  productTag: string | null;
  sourceType: string | null;
  sourceDetail: string | null;
  deviceType: string | null;
  events: bigint;
  visitors: bigint;
  sessions: bigint;
};
type FunnelRow = {
  pageVisitors: bigint;
  pageViews: bigint;
  visitSessions: bigint;
  engagedSessions: bigint;
  highIntentVisitors: bigint;
  formStartVisitors: bigint;
  stepCompletedVisitors: bigint;
  submissionVisitors: bigint;
};
type TrackingCoverageRow = { trackingStartAt: Date | string | null };
type BotRow = { visitors: bigint; events: bigint };
type QualityRow = { visitors: bigint; sessions: bigint; pageViews: bigint };
type PageFunnelRow = {
  pagePath: string | null;
  pageVisitors: bigint;
  highIntentVisitors: bigint;
  formStartVisitors: bigint;
  stepCompletedVisitors: bigint;
  submissionVisitors: bigint;
};

// 与数炬服务器日志侧 src/web_traffic.py 的 BOT_RE 逐字对齐。
// 两条口径必须一致，否则同一个官网会算出两个"访客数"。
const BOT_PATTERN =
  'bot|spider|crawler|slurp|headlesschrome|python-requests|go-http-client|' +
  'wget|curl/|scrapy|httpclient|uptimerobot|zgrab|masscan';

// 注意：服务端写入的 form_submit 事件不带 userAgent（见 custom-requirement.service.ts
// 的 sourceSnapshot），所以必须放行 NULL，否则询盘提交会被整批过滤掉，
// 漏斗最后一步永远是 0。
const NOT_BOT = Prisma.sql`("userAgent" IS NULL OR "userAgent" !~* ${BOT_PATTERN})`;

// 有效访问口径：同一次访问必须同时出现“前台累计停留 20 秒”和
// “真实滑动或点击”。两个信号都只是筛选条件，不宣称能证明绝对真人。
const VISIT_IDENTITY = Prisma.sql`COALESCE(NULLIF("sessionId", ''), NULLIF("visitorId", ''), 'event:' || "id"::text)`;
const IS_BOT = Prisma.sql`"userAgent" ~* ${BOT_PATTERN}`;
// 2026-08-20 18:20:22（上海时间）合并并启用“20秒+交互”口径。
// 覆盖起点必须是固定、可审计的发布时刻，不能由第一条达标结果反推。
export const EFFECTIVE_VISIT_RULE_STARTED_AT = new Date('2026-08-20T10:20:22.000Z');
// form_submit 是业务结果，只认与真实询盘 submissionId 关联的服务端记录。
// 历史上公开埋点入口写入的同名事件必须从所有统计中排除。
const VERIFIED_EVENT = Prisma.sql`("eventType" <> 'form_submit' OR "submissionId" IS NOT NULL)`;

// 历史事件曾把官网内部跳转和部分搜索引擎写成“外部链接”。
// Raw 事实不覆盖，只在读取时统一归类，这样旧数据不会继续污染看板。
const NORMALIZED_SOURCE_TYPE = Prisma.sql`CASE
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)jssngyl\\.cn$' THEN '无法识别'
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)(baidu\\.com|bing\\.com|google\\.com|google\\.com\\.hk|sogou\\.com|so\\.com)$' THEN '自然搜索'
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)(doubao\\.com|kimi\\.com|moonshot\\.cn|yuanbao\\.tencent\\.com|deepseek\\.com|tongyi\\.aliyun\\.com|qianwen\\.com|qwen\\.ai|metaso\\.cn|chatgpt\\.com|openai\\.com|perplexity\\.ai|yiyan\\.baidu\\.com|quark\\.cn)$' THEN 'AI引流'
  WHEN COALESCE(NULLIF("sourceType", ''), '无法识别') = '外部链接'
    AND NULLIF("sourceDetail", '') IS NULL THEN '无法识别'
  ELSE COALESCE(NULLIF("sourceType", ''), '无法识别')
END`;

const NORMALIZED_SOURCE_DETAIL = Prisma.sql`CASE
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)jssngyl\\.cn$' THEN NULL
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)baidu\\.com$' THEN '百度'
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)bing\\.com$' THEN '必应'
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)(google\\.com|google\\.com\\.hk)$' THEN 'Google'
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)sogou\\.com$' THEN '搜狗'
  WHEN LOWER(COALESCE("sourceDetail", '')) ~ '(^|\\.)so\\.com$' THEN '360搜索'
  ELSE NULLIF("sourceDetail", '')
END`;

function count(value: bigint | number | null | undefined) {
  return Number(value ?? 0);
}

function normalizedPageType(value: string | null | undefined) {
  if (value === '服务页') return '解决方案页';
  if (value === '资料文章') return '文章页';
  if (!value || value === '其他') return '其他页';
  return value;
}

function addUtcDay(day: string, amount: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function shanghaiDay(date: Date) {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 趋势图必须保留真实的零访问日，不能让日期从横轴上消失。 */
export function fillDailyPageViewGaps(rows: DailyRow[], startDay: string, endDay: string) {
  if (startDay > endDay) return rows;
  const existing = new Set(
    rows.filter((row) => row.eventType === 'page_view').map((row) => row.day),
  );
  const filled = [...rows];
  for (let day = startDay; day <= endDay; day = addUtcDay(day, 1)) {
    if (!existing.has(day)) {
      filled.push({ day, eventType: 'page_view', eventCount: 0n, visitorCount: 0n });
    }
  }
  return filled.sort((left, right) =>
    left.day === right.day
      ? left.eventType.localeCompare(right.eventType)
      : left.day.localeCompare(right.day),
  );
}

function dateRange(query: ShujuGrowthReadQueryDto) {
  const start = new Date(`${query.startDate.slice(0, 10)}T00:00:00+08:00`);
  const end = new Date(`${query.endDate.slice(0, 10)}T00:00:00+08:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new BadRequestException('Invalid growth date range');
  }
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days > 366) throw new BadRequestException('Growth date range exceeds 366 days');
  const endExclusive = new Date(end.getTime() + 86_400_000);
  return { start, endExclusive, days };
}

@Injectable()
export class ShujuGrowthReadService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(query: ShujuGrowthReadQueryDto) {
    const { start, endExclusive, days } = dateRange(query);
    const [trackingCoverage, dwellCoverage] = await Promise.all([
      this.prisma.$queryRaw<TrackingCoverageRow[]>(Prisma.sql`
      SELECT MIN("createdAt") AS "trackingStartAt"
      FROM "WebsiteLeadEvent"
      WHERE "eventType" = 'page_view' AND ${NOT_BOT}
    `),
      // 停留时长 2026-08-19 才上线，比埋点晚得多。
      // 不显式列举而写 LIKE 'dwell_%' 会踩坑：LIKE 里的下划线是单字符通配符。
      this.prisma.$queryRaw<TrackingCoverageRow[]>(Prisma.sql`
      SELECT MIN("createdAt") AS "trackingStartAt"
      FROM "WebsiteLeadEvent"
      WHERE "eventType" IN ('dwell_5s', 'dwell_20s', 'dwell_60s', 'dwell_180s') AND ${NOT_BOT}
    `),
    ]);
    const trackingStartValue = trackingCoverage[0]?.trackingStartAt;
    const trackingStartAt = trackingStartValue ? new Date(trackingStartValue) : null;
    const hasTrackingStart = Boolean(trackingStartAt && !Number.isNaN(trackingStartAt.getTime()));
    const trackingAvailableInRange = Boolean(
      hasTrackingStart && trackingStartAt!.getTime() < endExclusive.getTime(),
    );
    const dwellStartValue = dwellCoverage[0]?.trackingStartAt;
    const dwellStartAt = dwellStartValue ? new Date(dwellStartValue) : null;
    const hasDwellStart = Boolean(dwellStartAt && !Number.isNaN(dwellStartAt.getTime()));
    const comparableStart = trackingAvailableInRange
      ? new Date(Math.max(start.getTime(), trackingStartAt!.getTime()))
      : endExclusive;
    const qualityStart = new Date(
      Math.max(start.getTime(), EFFECTIVE_VISIT_RULE_STARTED_AT.getTime()),
    );
    const qualityAvailable = qualityStart.getTime() < endExclusive.getTime();
    const filters: Prisma.Sql[] = [
      Prisma.sql`"createdAt" >= ${start}`,
      Prisma.sql`"createdAt" < ${endExclusive}`,
    ];
    const deviceCoverageFilters: Prisma.Sql[] = [
      Prisma.sql`"createdAt" >= ${start}`,
      Prisma.sql`"createdAt" < ${endExclusive}`,
    ];
    const qualityFilters: Prisma.Sql[] = [
      Prisma.sql`"createdAt" >= ${qualityStart}`,
      Prisma.sql`"createdAt" < ${endExclusive}`,
    ];
    const addDimensionFilter = (filter: Prisma.Sql) => {
      filters.push(filter);
      qualityFilters.push(filter);
      deviceCoverageFilters.push(filter);
    };
    if (query.site && query.site !== 'all') {
      addDimensionFilter(
        Prisma.sql`("pagePath" = ${`/${query.site}`} OR "pagePath" LIKE ${`/${query.site}/%`})`,
      );
    }
    if (query.device && query.device !== 'all') {
      filters.push(Prisma.sql`"deviceType" = ${query.device}`);
      qualityFilters.push(Prisma.sql`"deviceType" = ${query.device}`);
    }
    if (query.sourceType && query.sourceType !== 'all') {
      addDimensionFilter(Prisma.sql`${NORMALIZED_SOURCE_TYPE} = ${query.sourceType}`);
    }
    if (query.pageType && query.pageType !== 'all') {
      if (query.pageType === '解决方案页') {
        addDimensionFilter(Prisma.sql`"pageType" IN ('解决方案页', '服务页')`);
      } else if (query.pageType === '文章页') {
        addDimensionFilter(Prisma.sql`"pageType" IN ('文章页', '资料文章')`);
      } else if (query.pageType === '其他页') {
        addDimensionFilter(Prisma.sql`("pageType" IN ('其他页', '其他') OR "pageType" IS NULL)`);
      } else {
        addDimensionFilter(Prisma.sql`"pageType" = ${query.pageType}`);
      }
    }
    // 有效访问只是一层质量标签，绝不能再作为所有事实查询的总开关。
    // 按 session_id 判定同一次访问：某个访客过去曾经有效，不代表他今天的每次短访都有效。
    const EFFECTIVE_VISIT_GATE = Prisma.sql`${VISIT_IDENTITY} IN (
      SELECT COALESCE(NULLIF(q."sessionId", ''), NULLIF(q."visitorId", ''), 'event:' || q."id"::text)
      FROM "WebsiteLeadEvent" q
      WHERE q."eventType" IN ('effective_interaction', 'dwell_20s')
        AND q."createdAt" >= ${qualityStart} AND q."createdAt" < ${endExclusive}
        AND (q."userAgent" IS NULL OR q."userAgent" !~* ${BOT_PATTERN})
      GROUP BY COALESCE(NULLIF(q."sessionId", ''), NULLIF(q."visitorId", ''), 'event:' || q."id"::text)
      HAVING COUNT(*) FILTER (WHERE q."eventType" = 'effective_interaction') > 0
         AND COUNT(*) FILTER (WHERE q."eventType" = 'dwell_20s') > 0
    )`;
    const where = Prisma.join([...filters, NOT_BOT, VERIFIED_EVENT], ' AND ');
    const deviceCoverageWhere = Prisma.join(
      [...deviceCoverageFilters, NOT_BOT, VERIFIED_EVENT],
      ' AND ',
    );
    const effectiveWhere = Prisma.join(
      [...qualityFilters, NOT_BOT, VERIFIED_EVENT, EFFECTIVE_VISIT_GATE],
      ' AND ',
    );
    // 同样的筛选条件，但只数被排除掉的那部分 —— 让"过滤了多少"看得见，而不是悄悄少掉。
    const botWhere = Prisma.join([...filters, IS_BOT, VERIFIED_EVENT], ' AND ');
    // 非已知机器人、但未满足“20 秒 + 滑动/点击”的访问单独回报，
    // 让界面能说清楚主数外还有多少访问，不静默丢数。
    const unverifiedWhere = Prisma.join(
      [...qualityFilters, NOT_BOT, VERIFIED_EVENT, Prisma.sql`NOT (${EFFECTIVE_VISIT_GATE})`],
      ' AND ',
    );
    const [
      counts,
      daily,
      sources,
      sourceDetails,
      landings,
      regions,
      regionCoverageRows,
      dimensionCoverageRows,
      exits,
      pages,
      segments,
      funnelRows,
      qualityRows,
      botRows,
      pageFunnelRows,
      unverifiedRows,
    ] = await Promise.all([
      this.prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT
          "eventType",
          COUNT(*)::bigint AS "eventCount",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS "visitorCount",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS "sessionCount"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
        GROUP BY "eventType"
      `),
      this.prisma.$queryRaw<DailyRow[]>(Prisma.sql`
        SELECT
          TO_CHAR("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day,
          "eventType",
          COUNT(*)::bigint AS "eventCount",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS "visitorCount"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
        GROUP BY day, "eventType"
        ORDER BY day ASC
      `),
      this.prisma.$queryRaw<SourceRow[]>(Prisma.sql`
        WITH scoped AS (
          SELECT *,
            COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text) AS identity,
            ${NORMALIZED_SOURCE_TYPE} AS normalized_source_type
          FROM "WebsiteLeadEvent"
          WHERE ${where}
        ), source_visitors AS (
          SELECT DISTINCT normalized_source_type, identity
          FROM scoped
          WHERE "eventType" = 'page_view'
        )
        SELECT
          s.normalized_source_type AS "sourceType",
          NULL::text AS "sourceDetail",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE s."eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'engaged_session' AND v.identity IS NOT NULL)::bigint AS "engagedVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" IN ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click') AND v.identity IS NOT NULL)::bigint AS "highIntentVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'form_start' AND v.identity IS NOT NULL)::bigint AS "formStarts",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'form_step_complete' AND v.identity IS NOT NULL)::bigint AS "stepCompleted",
          COUNT(DISTINCT s."submissionId") FILTER (WHERE s."eventType" = 'form_submit')::bigint AS submissions
        FROM scoped s
        LEFT JOIN source_visitors v
          ON v.normalized_source_type = s.normalized_source_type AND v.identity = s.identity
        GROUP BY s.normalized_source_type
        ORDER BY "pageViews" DESC, visitors DESC
      `),
      this.prisma.$queryRaw<SourceRow[]>(Prisma.sql`
        WITH scoped AS (
          SELECT *,
            COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text) AS identity,
            ${NORMALIZED_SOURCE_TYPE} AS normalized_source_type,
            ${NORMALIZED_SOURCE_DETAIL} AS normalized_source_detail
          FROM "WebsiteLeadEvent"
          WHERE ${where}
        ), source_visitors AS (
          SELECT DISTINCT normalized_source_type, normalized_source_detail, identity
          FROM scoped
          WHERE "eventType" = 'page_view'
        )
        SELECT
          s.normalized_source_type AS "sourceType",
          s.normalized_source_detail AS "sourceDetail",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE s."eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'engaged_session' AND v.identity IS NOT NULL)::bigint AS "engagedVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" IN ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click') AND v.identity IS NOT NULL)::bigint AS "highIntentVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'form_start' AND v.identity IS NOT NULL)::bigint AS "formStarts",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'form_step_complete' AND v.identity IS NOT NULL)::bigint AS "stepCompleted",
          COUNT(DISTINCT s."submissionId") FILTER (WHERE s."eventType" = 'form_submit')::bigint AS submissions
        FROM scoped s
        LEFT JOIN source_visitors v
          ON v.normalized_source_type = s.normalized_source_type
          AND v.normalized_source_detail IS NOT DISTINCT FROM s.normalized_source_detail
          AND v.identity = s.identity
        WHERE s.normalized_source_detail IS NOT NULL
        GROUP BY s.normalized_source_type, s.normalized_source_detail
        ORDER BY "pageViews" DESC, visitors DESC
        LIMIT 200
      `),
      this.prisma.$queryRaw<LandingRow[]>(Prisma.sql`
        SELECT
          "landingPage",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS sessions,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
          AND "landingPage" IS NOT NULL
        GROUP BY "landingPage"
        ORDER BY sessions DESC, "pageViews" DESC
        LIMIT 100
      `),
      // 客户所在地：省级汇总。沿用事实层 where，只排已知机器人，
      // 不能再用“20秒+交互”过滤地区行为和真实提交。
      this.prisma.$queryRaw<RegionRow[]>(Prisma.sql`
        SELECT
          "province",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS sessions,
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'engaged_session')::bigint AS "engagedVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click','form_start','form_step_complete','form_submit'))::bigint AS "highIntentVisitors"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
          AND "province" IS NOT NULL
          AND "regionSource" IN ('exact_ip', 'stable_masked_prefix')
        GROUP BY "province"
        ORDER BY visitors DESC
        LIMIT 40
      `),
      this.prisma.$queryRaw<RegionCoverageRow[]>(Prisma.sql`
        SELECT
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))
            FILTER (WHERE "eventType" = 'page_view')::bigint AS "eligibleVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))
            FILTER (
              WHERE "eventType" = 'page_view'
                AND "province" IS NOT NULL
                AND "regionSource" IN ('exact_ip', 'stable_masked_prefix')
            )::bigint AS "resolvedVisitors"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
      `),
      this.prisma.$queryRaw<DimensionCoverageRow[]>(Prisma.sql`
        SELECT
          (
            SELECT COUNT(DISTINCT "submissionId")::bigint
            FROM "WebsiteLeadEvent"
            WHERE ${deviceCoverageWhere}
              AND "eventType" = 'form_submit'
              AND "deviceType" IS NULL
          ) AS "unknownDeviceSubmissions",
          (
            SELECT COUNT(DISTINCT "submissionId")::bigint
            FROM "WebsiteLeadEvent"
            WHERE ${where}
              AND "eventType" = 'form_submit'
              AND "province" IS NULL
          ) AS "unknownRegionSubmissions"
      `),
      // 退出页 = 一次访问里最后打开的那个页面。
      // 不需要额外埋点：从已有的 page_view 按会话取最后一条即可，历史数据同样算得出。
      // 只看过一页的访问，那一页既是入口也是出口——这是标准口径，不做特殊处理。
      this.prisma.$queryRaw<ExitRow[]>(Prisma.sql`
        WITH last_view AS (
          SELECT DISTINCT ON (COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text))
            COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text) AS session_key,
            "pagePath"
          FROM "WebsiteLeadEvent"
          WHERE ${where}
            AND "eventType" = 'page_view'
            AND "pagePath" IS NOT NULL
          ORDER BY session_key, "createdAt" DESC, "id" DESC
        )
        SELECT "pagePath", COUNT(*)::bigint AS sessions
        FROM last_view
        GROUP BY "pagePath"
        ORDER BY sessions DESC
        LIMIT 20
      `),
      this.prisma.$queryRaw<PageRow[]>(Prisma.sql`
        WITH scoped AS (
          SELECT *,
            COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text) AS identity
          FROM "WebsiteLeadEvent"
          WHERE ${where}
            AND "pagePath" IS NOT NULL
        ), page_visitors AS (
          SELECT DISTINCT "pagePath", identity
          FROM scoped
          WHERE "eventType" = 'page_view'
        )
        SELECT
          s."pagePath",
          MAX(s."pageTitle") AS "pageTitle",
          MAX(s."pageType") AS "pageType",
          MAX(s."productTag") AS "productTag",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE s."eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'engaged_session' AND v.identity IS NOT NULL)::bigint AS "engagedVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" IN ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click') AND v.identity IS NOT NULL)::bigint AS "highIntentVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'form_start' AND v.identity IS NOT NULL)::bigint AS "formStarts",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'form_step_complete' AND v.identity IS NOT NULL)::bigint AS "stepCompleted",
          COUNT(DISTINCT s."submissionId") FILTER (WHERE s."eventType" = 'form_submit')::bigint AS submissions
        FROM scoped s
        LEFT JOIN page_visitors v
          ON v."pagePath" = s."pagePath" AND v.identity = s.identity
        GROUP BY s."pagePath"
        ORDER BY "pageViews" DESC, visitors DESC
        LIMIT 200
      `),
      this.prisma.$queryRaw<SegmentRow[]>(Prisma.sql`
        SELECT
          TO_CHAR("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day,
          "eventType",
          "pagePath",
          MAX("pageTitle") AS "pageTitle",
          MAX("pageType") AS "pageType",
          MAX("productTag") AS "productTag",
          "sourceType",
          "sourceDetail",
          "deviceType",
          COUNT(*)::bigint AS events,
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS visitors,
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS sessions
        FROM "WebsiteLeadEvent"
        WHERE ${where}
        GROUP BY day, "eventType", "pagePath", "sourceType", "sourceDetail", "deviceType"
        ORDER BY day ASC, events DESC
      `),
      this.prisma.$queryRaw<FunnelRow[]>(Prisma.sql`
        WITH scoped AS (
          SELECT
            *,
            COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text) AS identity
          FROM "WebsiteLeadEvent"
          WHERE ${where}
        )
        SELECT
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageVisitors",
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), identity)) FILTER (WHERE "eventType" = 'page_view')::bigint AS "visitSessions",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), identity)) FILTER (WHERE "eventType" = 'engaged_session')::bigint AS "engagedSessions",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click','form_start','form_step_complete','form_submit'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('form_start','form_step_complete','form_submit'))::bigint AS "formStartVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('form_step_complete','form_submit'))::bigint AS "stepCompletedVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" = 'form_submit')::bigint AS "submissionVisitors"
        FROM scoped
      `),
      this.prisma.$queryRaw<QualityRow[]>(Prisma.sql`
        SELECT
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS sessions,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews"
        FROM "WebsiteLeadEvent"
        WHERE ${effectiveWhere}
      `),
      this.prisma.$queryRaw<BotRow[]>(Prisma.sql`
        SELECT
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS events
        FROM "WebsiteLeadEvent"
        WHERE ${botWhere}
      `),
      // 单页漏斗的后四步使用累计口径。服务端提交是核心事实，
      // 即使浏览器的 page_view 或访问标识丢失，也必须按它自带的 pagePath 进入提交步骤。
      // 因此不再用 page_view cohort 删除其他事实；若第一步小于后续步骤，前端会显示数量并停止计算转化率。
      this.prisma.$queryRaw<PageFunnelRow[]>(Prisma.sql`
        WITH scoped AS (
          SELECT
            "pagePath",
            "eventType",
            COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text) AS identity
          FROM "WebsiteLeadEvent"
          WHERE ${where} AND "pagePath" IS NOT NULL
        )
        SELECT
          "pagePath",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click','form_start','form_step_complete','form_submit'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('form_start','form_step_complete','form_submit'))::bigint AS "formStartVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('form_step_complete','form_submit'))::bigint AS "stepCompletedVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" = 'form_submit')::bigint AS "submissionVisitors"
        FROM scoped
        GROUP BY "pagePath"
        ORDER BY "pageVisitors" DESC
        LIMIT 200
      `),
      this.prisma.$queryRaw<BotRow[]>(Prisma.sql`
        SELECT
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS events
        FROM "WebsiteLeadEvent"
        WHERE ${unverifiedWhere}
      `),
    ]);

    return {
      range: {
        startDate: query.startDate.slice(0, 10),
        endDate: query.endDate.slice(0, 10),
        days,
        filters: {
          site: query.site || 'all',
          device: query.device || 'all',
          sourceType: query.sourceType || 'all',
          pageType: query.pageType || 'all',
        },
      },
      generatedAt: new Date().toISOString(),
      coverage: {
        trackingStartAt: hasTrackingStart ? trackingStartAt!.toISOString() : null,
        trackingAvailableInRange,
        verifiedStartAt: EFFECTIVE_VISIT_RULE_STARTED_AT.toISOString(),
        // 停留时长自己的起点。刻意不并进 comparableStart——它是子指标，
        // 把整个窗口缩到它的上线日会让别的数字凭空变小。
        dwellStartAt: hasDwellStart ? dwellStartAt!.toISOString() : null,
        region: {
          eligibleVisitors: count(regionCoverageRows[0]?.eligibleVisitors),
          resolvedVisitors: count(regionCoverageRows[0]?.resolvedVisitors),
          rate: count(regionCoverageRows[0]?.eligibleVisitors)
            ? count(regionCoverageRows[0]?.resolvedVisitors) /
              count(regionCoverageRows[0]?.eligibleVisitors)
            : null,
          unknownSubmissions: count(dimensionCoverageRows[0]?.unknownRegionSubmissions),
        },
        device: {
          unknownSubmissions: count(dimensionCoverageRows[0]?.unknownDeviceSubmissions),
        },
        verified: qualityAvailable,
        comparableStartAt: comparableStart.toISOString(),
        qualityStartAt: qualityStart.toISOString(),
        qualityFullRange: start.getTime() >= EFFECTIVE_VISIT_RULE_STARTED_AT.getTime(),
        fullRange: trackingAvailableInRange && trackingStartAt!.getTime() <= start.getTime(),
        reason: !hasTrackingStart
          ? 'page_view_not_started'
          : !trackingAvailableInRange
            ? 'tracking_not_started_in_range'
            : trackingStartAt!.getTime() > start.getTime()
              ? 'partial_tracking_window'
              : null,
      },
      quality: {
        effectiveVisitors: qualityAvailable ? count(qualityRows[0]?.visitors) : null,
        effectiveSessions: qualityAvailable ? count(qualityRows[0]?.sessions) : null,
        effectivePageViews: qualityAvailable ? count(qualityRows[0]?.pageViews) : null,
      },
      // 未满足有效访问口径的其他访问。它与有效访问使用同一个固定质量窗口，
      // 只做质量分组，不影响事实层的访问、页面、漏斗和提交。
      unverified: {
        visitors: qualityAvailable ? count(unverifiedRows[0]?.visitors) : null,
        events: qualityAvailable ? count(unverifiedRows[0]?.events) : null,
      },
      botFiltered: {
        // 已从上面所有口径里排除的机器人访问量。展示它是为了让"过滤"这件事可见，
        // 而不是让数字悄悄变小。判据只有 userAgent 特征，伪装成普通浏览器的
        // 自动流量抓不到 —— 这一点必须在界面上说清楚，不能让人以为剩下的都是真人。
        visitors: count(botRows[0]?.visitors),
        events: count(botRows[0]?.events),
        pattern: BOT_PATTERN,
      },
      funnel: {
        pageVisitors: count(funnelRows[0]?.pageVisitors),
        pageViews: count(funnelRows[0]?.pageViews),
        visitSessions: count(funnelRows[0]?.visitSessions),
        engagedSessions: count(funnelRows[0]?.engagedSessions),
        highIntentVisitors: count(funnelRows[0]?.highIntentVisitors),
        formStartVisitors: count(funnelRows[0]?.formStartVisitors),
        stepCompletedVisitors: count(funnelRows[0]?.stepCompletedVisitors),
        submissionVisitors: count(funnelRows[0]?.submissionVisitors),
      },
      eventCounts: Object.fromEntries(
        counts.map((row) => [
          row.eventType,
          {
            events: count(row.eventCount),
            visitors: count(row.visitorCount),
            sessions: count(row.sessionCount),
          },
        ]),
      ),
      daily: fillDailyPageViewGaps(
        daily,
        shanghaiDay(comparableStart),
        query.endDate.slice(0, 10),
      ).map((row) => ({
        date: row.day,
        eventType: row.eventType,
        events: count(row.eventCount),
        visitors: count(row.visitorCount),
      })),
      sources: sources.map((row) => ({
        sourceType: row.sourceType || '无法识别',
        sourceDetail: row.sourceDetail || null,
        visitors: count(row.visitors),
        pageViews: count(row.pageViews),
        engagedVisitors: count(row.engagedVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStarts: count(row.formStarts),
        stepCompleted: count(row.stepCompleted),
        submissions: count(row.submissions),
      })),
      sourceDetails: sourceDetails.map((row) => ({
        sourceType: row.sourceType || '无法识别',
        sourceDetail: row.sourceDetail || null,
        visitors: count(row.visitors),
        pageViews: count(row.pageViews),
        engagedVisitors: count(row.engagedVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStarts: count(row.formStarts),
        stepCompleted: count(row.stepCompleted),
        submissions: count(row.submissions),
      })),
      regions: regions.map((row) => ({
        province: row.province,
        visitors: count(row.visitors),
        sessions: count(row.sessions),
        engagedVisitors: count(row.engagedVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
      })),
      exits: exits.map((row) => ({
        pagePath: row.pagePath,
        sessions: count(row.sessions),
      })),
      landings: landings.map((row) => ({
        pagePath: row.landingPage,
        visitors: count(row.visitors),
        sessions: count(row.sessions),
        pageViews: count(row.pageViews),
      })),
      pages: pages.map((row) => ({
        pagePath: row.pagePath,
        pageTitle: row.pageTitle,
        pageType: normalizedPageType(row.pageType),
        productTag: row.productTag || '其他',
        visitors: count(row.visitors),
        pageViews: count(row.pageViews),
        engagedVisitors: count(row.engagedVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStarts: count(row.formStarts),
        stepCompleted: count(row.stepCompleted),
        submissions: count(row.submissions),
      })),
      // 单页下钻专用（累计口径）。页面表那几列仍用 pages 里的互斥计数，
      // 两者名字不同、含义不同，不要混用。
      pageFunnels: pageFunnelRows.map((row) => ({
        pagePath: row.pagePath,
        pageVisitors: count(row.pageVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStartVisitors: count(row.formStartVisitors),
        stepCompletedVisitors: count(row.stepCompletedVisitors),
        submissionVisitors: count(row.submissionVisitors),
      })),
      segments: segments.map((row) => ({
        date: row.day,
        eventType: row.eventType,
        pagePath: row.pagePath,
        pageTitle: row.pageTitle,
        pageType: normalizedPageType(row.pageType),
        productTag: row.productTag || '其他',
        sourceType: row.sourceType || '无法识别',
        sourceDetail: row.sourceDetail || null,
        deviceType: row.deviceType || '无法识别',
        events: count(row.events),
        visitors: count(row.visitors),
        sessions: count(row.sessions),
      })),
    };
  }
}
