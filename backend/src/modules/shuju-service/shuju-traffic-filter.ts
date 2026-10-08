import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

// 与数炬日志侧的 BOT_RE 保持一致；NULL UA 的服务端业务记录仍可通过。
export const BOT_PATTERN =
  'bot|spider|crawler|slurp|headlesschrome|python-requests|go-http-client|' +
  'wget|curl/|scrapy|httpclient|uptimerobot|zgrab|masscan';

function column(alias: string, name: string) {
  // Aliases are internal identifiers, never query input. Qualify every outer reference
  // so the automation subquery cannot silently bind its sessionId to itself.
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(alias)) throw new Error('Invalid traffic SQL alias');
  return Prisma.raw(`"${alias}"."${name}"`);
}

function sessionProfiles(prefix: string) {
  // Only validated, publicly routable IPv4 /16 masks count as independent prefixes.
  // Exclude special-use /16s conservatively: the stored mask cannot distinguish
  // smaller reserved blocks inside them. A malformed/IPv6/missing mask is unknown.
  return Prisma.raw(`
    ${prefix}_meta AS MATERIALIZED (
      SELECT "sessionId" AS session,
        MIN("createdAt") FILTER (WHERE "eventType" = 'page_view') AS first_page,
        (ARRAY_AGG(NULLIF(BTRIM("visitorId"), '') ORDER BY "createdAt", id)
          FILTER (WHERE "eventType" = 'page_view'))[1] AS visitor,
        MIN(NULLIF(BTRIM("userAgent"), '')) AS ua,
        COUNT(DISTINCT NULLIF(BTRIM("userAgent"), '')) = 1
          AND COUNT(*) FILTER (WHERE NULLIF(BTRIM("userAgent"), '') IS NULL) = 0 AS stable_ua,
        BOOL_OR("eventType" = 'dwell_20s') AS has_dwell20,
        BOOL_OR("eventType" IN ('human_signal', 'effective_interaction')) AS interactive,
        BOOL_OR("eventType" = 'form_submit' AND "submissionId" IS NOT NULL) AS verified_form,
        BOOL_OR("eventType" = 'automation_signal'
          OR COALESCE(properties->'automationDetected' = 'true'::jsonb, FALSE)) AS marked_automation,
        BOOL_OR(COALESCE(properties->'manual_qa' = 'true'::jsonb, FALSE)) AS manual_qa
      FROM ${prefix}_events GROUP BY "sessionId"
    ), ${prefix}_parsed_ips AS MATERIALIZED (
      SELECT e."sessionId" AS session, e."createdAt",
        CASE WHEN e."ipMasked" ~ '^[0-9]{1,3}\\.[0-9]{1,3}\\.xxx\\.xxx$'
          THEN SPLIT_PART(e."ipMasked", '.', 1)::int END AS first,
        CASE WHEN e."ipMasked" ~ '^[0-9]{1,3}\\.[0-9]{1,3}\\.xxx\\.xxx$'
          THEN SPLIT_PART(e."ipMasked", '.', 2)::int END AS second
      FROM ${prefix}_events e JOIN ${prefix}_meta m ON m.session = e."sessionId"
      WHERE e."createdAt" >= m.first_page
        AND e."createdAt" < m.first_page + INTERVAL '60 seconds'
    ), ${prefix}_public_ips AS MATERIALIZED (
      SELECT session, CASE WHEN first BETWEEN 1 AND 223 AND second BETWEEN 0 AND 255
        AND first NOT IN (10, 127)
        AND NOT (first = 100 AND second BETWEEN 64 AND 127)
        AND NOT (first = 169 AND second = 254)
        AND NOT (first = 172 AND second BETWEEN 16 AND 31)
        AND NOT (first = 192 AND second IN (0, 88, 168))
        AND NOT (first = 198 AND second IN (18, 19, 51))
        AND NOT (first = 203 AND second = 0)
        THEN first::text || '.' || second::text END AS public_prefix
      FROM ${prefix}_parsed_ips
    ), ${prefix}_profiles AS MATERIALIZED (
      SELECT m.*, COALESCE(p.prefixes, 0) AS prefixes,
        COALESCE(p.unknown_ip, TRUE) AS unknown_ip
      FROM ${prefix}_meta m LEFT JOIN (
        SELECT session, COUNT(DISTINCT public_prefix) AS prefixes,
          BOOL_OR(public_prefix IS NULL) AS unknown_ip
        FROM ${prefix}_public_ips GROUP BY session
      ) p USING (session)
    )
  `);
}

function eligibleProfile(alias: string) {
  return Prisma.sql`(${Prisma.raw(`${alias}.first_page IS NOT NULL AND ${alias}.visitor IS NOT NULL AND ${alias}.has_dwell20
    AND ${alias}.stable_ua AND NOT ${alias}.interactive AND NOT ${alias}.verified_form
    AND NOT ${alias}.marked_automation AND NOT ${alias}.manual_qa
    AND NOT ${alias}.unknown_ip`)} AND ${column(alias, 'ua')} !~* ${BOT_PATTERN})`;
}

/** Classify sessions once; all lifecycle and seed evidence is independent of UI filters. */
export async function classifySessionIds(prisma: PrismaService, candidates: Prisma.Sql) {
  const rows = await prisma.$queryRaw<{ sessionId: string }[]>(Prisma.sql`
    WITH candidate_sessions AS MATERIALIZED (${candidates}),
    candidate_events AS MATERIALIZED (
      SELECT e.* FROM candidate_sessions c
      JOIN "WebsiteLeadEvent" e ON e."sessionId" = c.session
    ), ${sessionProfiles('candidate')},
    windows AS (
      SELECT ua, first_page - INTERVAL '5 minutes' AS lo,
        first_page + INTERVAL '5 minutes' AS hi
      FROM candidate_profiles c WHERE ${eligibleProfile('c')} AND c.prefixes >= 2
    ), prior_windows AS (
      SELECT *, MAX(hi) OVER (PARTITION BY ua ORDER BY lo, hi
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS prior_hi FROM windows
    ), window_groups AS (
      SELECT *, SUM(CASE WHEN prior_hi IS NULL OR lo >= prior_hi THEN 1 ELSE 0 END)
        OVER (PARTITION BY ua ORDER BY lo, hi) AS group_id FROM prior_windows
    ), merged_windows AS MATERIALIZED (
      SELECT ua, MIN(lo) AS lo, MAX(hi) AS hi FROM window_groups GROUP BY ua, group_id
    ), seed_sessions AS MATERIALIZED (
      SELECT DISTINCT e."sessionId" AS session
      FROM merged_windows w JOIN "WebsiteLeadEvent" e
        ON e."createdAt" >= w.lo AND e."createdAt" < w.hi
        AND e."userAgent" = w.ua AND e."eventType" = 'page_view'
      WHERE NULLIF(BTRIM(e."sessionId"), '') IS NOT NULL
    ), seed_events AS MATERIALIZED (
      SELECT e.* FROM seed_sessions s
      JOIN "WebsiteLeadEvent" e ON e."sessionId" = s.session
    ), ${sessionProfiles('seed')},
    strong_seeds AS MATERIALIZED (
      SELECT * FROM seed_profiles s WHERE ${eligibleProfile('s')}
        AND s.prefixes >= 3 AND s.visitor IS NOT NULL
    ), anomalous_sessions AS (
      SELECT c.session FROM candidate_profiles c JOIN strong_seeds s
        ON s.ua = c.ua AND s.first_page >= c.first_page - INTERVAL '5 minutes'
        AND s.first_page < c.first_page + INTERVAL '5 minutes'
      WHERE ${eligibleProfile('c')} AND c.prefixes >= 2
      GROUP BY c.session HAVING COUNT(DISTINCT s.visitor) >= 10
    )
    SELECT session AS "sessionId" FROM candidate_profiles
      WHERE marked_automation OR manual_qa
    UNION SELECT session AS "sessionId" FROM anomalous_sessions
  `);
  return rows.map((row) => row.sessionId);
}

/** Range selects visits only; full session/nearby seed history determines their class. */
export async function readAutomatedSessions(prisma: PrismaService, start: Date, end: Date) {
  return classifySessionIds(
    prisma,
    Prisma.sql`
    SELECT DISTINCT "sessionId" AS session FROM "WebsiteLeadEvent"
    WHERE "createdAt" >= ${start} AND "createdAt" < ${end}
      AND NULLIF(BTRIM("sessionId"), '') IS NOT NULL
  `,
  );
}

type CoverageEvent = {
  id: number;
  createdAt: Date;
  sessionId: string | null;
  eventType: string;
  userAgent: string | null;
  properties: Prisma.JsonValue;
};

/** Find the first retained record in batches, sharing the exact session classifier. */
export async function readTrafficCoverageStart(
  prisma: PrismaService,
  eventTypes: readonly string[],
  indexedBot = false,
) {
  if (!eventTypes.length) return null;
  let cursor: { createdAt: Date; id: number } | undefined;
  while (true) {
    const rows = await prisma.$queryRaw<CoverageEvent[]>(Prisma.sql`
      SELECT id, "createdAt", "sessionId", "eventType", "userAgent", properties
      FROM "WebsiteLeadEvent"
      WHERE "eventType" = ANY(${eventTypes}::text[])
        AND ${indexedBot ? Prisma.sql`NOT "isBot"` : Prisma.sql`("userAgent" IS NULL OR "userAgent" !~* ${BOT_PATTERN})`}
        ${cursor ? Prisma.sql`AND ("createdAt", id) > (${cursor.createdAt}, ${cursor.id})` : Prisma.empty}
      ORDER BY "createdAt", id LIMIT 128
    `);
    if (!rows.length) return null;
    const sessions = [
      ...new Set(
        rows.map((row) => row.sessionId).filter((id): id is string => Boolean(id?.trim())),
      ),
    ];
    const excluded = new Set(
      sessions.length
        ? await classifySessionIds(
            prisma,
            Prisma.sql`SELECT UNNEST(${sessions}::text[]) AS session`,
          )
        : [],
    );
    for (const row of rows) {
      const properties = row.properties as Record<string, unknown> | null;
      if (
        !excluded.has(row.sessionId || '') &&
        row.eventType !== 'automation_signal' &&
        properties?.automationDetected !== true &&
        properties?.manual_qa !== true
      ) {
        return new Date(row.createdAt);
      }
    }
    const last = rows[rows.length - 1];
    cursor = { createdAt: last.createdAt, id: last.id };
  }
}

function hasAutomatedSession(alias: string, sessions: readonly string[]) {
  const session = column(alias, 'sessionId');
  return sessions.length
    ? Prisma.sql`COALESCE(${session} = ANY(${sessions}::text[]), FALSE)`
    : Prisma.sql`FALSE`;
}

export function excludedTraffic(alias: string, sessions: readonly string[], indexedBot = false) {
  const ua = column(alias, 'userAgent');
  const event = column(alias, 'eventType');
  const submission = column(alias, 'submissionId');
  const properties = column(alias, 'properties');
  const bot = indexedBot
    ? column(alias, 'isBot')
    : Prisma.sql`COALESCE(${ua} ~* ${BOT_PATTERN}, FALSE)`;
  return Prisma.sql`(${bot} OR (
    NOT (${event} = 'form_submit' AND ${submission} IS NOT NULL)
    AND (${hasAutomatedSession(alias, sessions)}
      OR ${event} = 'automation_signal'
      OR COALESCE(${properties}->'automationDetected' = 'true'::jsonb, FALSE)
      OR COALESCE(${properties}->'manual_qa' = 'true'::jsonb, FALSE))
  ))`;
}

export function allowedTraffic(alias: string, sessions: readonly string[], indexedBot = false) {
  return Prisma.sql`NOT (${excludedTraffic(alias, sessions, indexedBot)})`;
}
