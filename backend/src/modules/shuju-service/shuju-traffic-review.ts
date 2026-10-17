import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { allowedTraffic, hasManualQaMarker } from './shuju-traffic-filter';

type Metrics = { visitors: number; sessions: number; pageViews: number; dwell20Visitors: number };
type ReviewRow = {
  groups: Record<string, Metrics>;
  gaps: Record<string, number>;
  submissions: Record<string, number>;
};
const emptyMetrics = (): Metrics => ({
  visitors: 0,
  sessions: 0,
  pageViews: 0,
  dwell20Visitors: 0,
});

/** Read-only parallel comparison. This does not replace any existing overview metric.
 * Session evidence is lifecycle-wide; aggregation uses exactly the selected range/dimensions.
 * Distinct visitors can occur in multiple session groups and must never be subtracted/summed.
 */
export async function readTrafficReview(
  prisma: PrismaService | Prisma.TransactionClient,
  scopedWhere: Prisma.Sql,
  automatedSessions: readonly string[],
  startDay: string,
  endDay: string,
) {
  const automated = automatedSessions.length
    ? Prisma.sql`COALESCE(s.sid = ANY(${automatedSessions}::text[]), FALSE)`
    : Prisma.sql`FALSE`;
  const query = Prisma.sql`
    WITH scoped AS MATERIALIZED (
      SELECT "eventType", "submissionId", "isBot",
        NULLIF(BTRIM("sessionId"), '') AS sid,
        NULLIF(BTRIM("visitorId"), '') AS vid,
        "eventType" = 'automation_signal' OR COALESCE(properties->'automationDetected' = 'true'::jsonb, FALSE) AS automation,
        ${hasManualQaMarker('WebsiteLeadEvent')} AS qa,
        properties->'internal_traffic' = 'true'::jsonb AS internal,
        "eventType" IN ('human_signal', 'effective_interaction')
          AND properties->'evidenceVersion' = '1'::jsonb
          AND properties->>'interactionStrength' = 'strong'
          AND properties->>'interactionType' IN ('click', 'pointerdown', 'touchstart', 'keydown') AS strong_input,
        properties->>'collectorVersion' = '2' AS new_collector,
        properties->'serverEvidence'->'version' = '1'::jsonb AS server_evidence,
        ${allowedTraffic('WebsiteLeadEvent', automatedSessions, true)} AS legacy_allowed
      FROM "WebsiteLeadEvent" WHERE ${scopedWhere}
    ), sessions AS MATERIALIZED (
      SELECT DISTINCT sid FROM scoped WHERE sid IS NOT NULL
    ), lifecycle AS MATERIALIZED (
      SELECT e."sessionId" AS sid,
        BOOL_OR(e."isBot") AS bot,
        BOOL_OR(e."eventType" = 'automation_signal' OR COALESCE(e.properties->'automationDetected' = 'true'::jsonb, FALSE)) AS automation,
        BOOL_OR(${hasManualQaMarker('e')}) AS qa,
        BOOL_OR(COALESCE(e.properties->'internal_traffic' = 'true'::jsonb, FALSE)) AS internal
      FROM sessions JOIN "WebsiteLeadEvent" e ON e."sessionId" = sessions.sid
      GROUP BY e."sessionId"
    ), reasons AS MATERIALIZED (
      SELECT s.*, CASE
        WHEN "eventType" = 'form_submit' AND s.qa THEN 'manual_qa'
        WHEN "eventType" = 'form_submit' AND "submissionId" IS NOT NULL THEN NULL
        WHEN COALESCE(l.bot, s."isBot") THEN 'known_bot_agent'
        WHEN COALESCE(l.automation, s.automation) THEN 'automation_marker'
        WHEN COALESCE(l.qa, s.qa, FALSE) THEN 'manual_qa'
        WHEN COALESCE(l.internal, s.internal, FALSE) THEN 'internal_traffic'
        ELSE NULL END AS explicit_reason,
        ${automated} AS inferred_or_marked
      FROM scoped s LEFT JOIN lifecycle l USING (sid)
    ), classified AS MATERIALIZED (
      SELECT *, CASE WHEN explicit_reason IS NOT NULL THEN 'explicitExcluded'
        WHEN inferred_or_marked AND "eventType" <> 'form_submit' THEN 'pendingReview'
        ELSE 'unclassified' END AS category
      FROM reasons
    ), candidate_sessions AS MATERIALIZED (
      SELECT sid,
        BOOL_OR("eventType" = 'page_view') AS page,
        BOOL_OR("eventType" IN ('dwell_5s', 'dwell_20s', 'dwell_60s', 'dwell_180s')) AS dwell,
        BOOL_OR("eventType" = 'dwell_20s') AS dwell20,
        BOOL_OR(strong_input) AS strong
      FROM classified WHERE explicit_reason IS NULL AND sid IS NOT NULL GROUP BY sid
    ), expanded AS (
      SELECT 'recorded' AS bucket, c."eventType", c.sid, c.vid FROM classified c
      UNION ALL SELECT 'legacy', c."eventType", c.sid, c.vid FROM classified c WHERE legacy_allowed
      UNION ALL SELECT 'candidate', c."eventType", c.sid, c.vid FROM classified c WHERE explicit_reason IS NULL
      UNION ALL SELECT category, c."eventType", c.sid, c.vid FROM classified c
      UNION ALL SELECT explicit_reason, c."eventType", c.sid, c.vid FROM classified c WHERE explicit_reason IS NOT NULL
      UNION ALL SELECT 'behavior_network_inference', c."eventType", c.sid, c.vid FROM classified c WHERE category = 'pendingReview'
    ), aggregates AS (
      SELECT bucket, JSONB_BUILD_OBJECT(
        'visitors', COUNT(DISTINCT vid) FILTER (WHERE "eventType" = 'page_view'),
        'sessions', COUNT(DISTINCT sid) FILTER (WHERE "eventType" = 'page_view'),
        'pageViews', COUNT(*) FILTER (WHERE "eventType" = 'page_view'),
        'dwell20Visitors', COUNT(DISTINCT vid) FILTER (WHERE "eventType" = 'dwell_20s')
      ) AS metrics FROM expanded GROUP BY bucket
    )
    SELECT (SELECT JSONB_OBJECT_AGG(bucket, metrics) FROM aggregates) AS groups,
      JSONB_BUILD_OBJECT(
        'pageViewsWithoutSession', (SELECT COUNT(*) FROM classified WHERE "eventType" = 'page_view' AND sid IS NULL),
        'pageViewsWithoutVisitor', (SELECT COUNT(*) FROM classified WHERE "eventType" = 'page_view' AND vid IS NULL),
        'candidateDwellSessionsWithoutPageViewInScope', (SELECT COUNT(*) FROM candidate_sessions WHERE dwell AND NOT page),
        'candidateStrongInputSessions', (SELECT COUNT(*) FROM candidate_sessions WHERE strong),
        'candidateDwell20WithStrongInputSessions', (SELECT COUNT(*) FROM candidate_sessions WHERE page AND dwell20 AND strong),
        'candidatePageSessionsWithoutStrongInput', (SELECT COUNT(*) FROM candidate_sessions WHERE page AND NOT strong),
        'candidatePageSessionsWithNewCollector', (SELECT COUNT(DISTINCT sid) FROM classified WHERE explicit_reason IS NULL AND "eventType" = 'page_view' AND new_collector),
        'candidatePageSessionsWithServerEvidence', (SELECT COUNT(DISTINCT sid) FROM classified WHERE explicit_reason IS NULL AND "eventType" = 'page_view' AND server_evidence)
      ) AS gaps,
      JSONB_BUILD_OBJECT(
        'recorded', (SELECT COUNT(DISTINCT "submissionId") FROM classified WHERE "eventType" = 'form_submit'),
        'manualQaExcluded', (SELECT COUNT(DISTINCT "submissionId") FROM classified WHERE "eventType" = 'form_submit' AND explicit_reason = 'manual_qa'),
        'candidate', (SELECT COUNT(DISTINCT "submissionId") FROM classified WHERE "eventType" = 'form_submit' AND explicit_reason IS NULL),
        'legacy', (SELECT COUNT(DISTINCT "submissionId") FROM classified WHERE "eventType" = 'form_submit' AND legacy_allowed)
      ) AS submissions
  `;
  // This one-off aggregate spends more time compiling than executing on the
  // production dataset. Keep the setting local to its read-only transaction.
  const read = async (transaction: Prisma.TransactionClient) => {
    await transaction.$executeRaw`SET LOCAL jit = off`;
    return transaction.$queryRaw<ReviewRow[]>(query);
  };
  let rows: ReviewRow[];
  if ('$transaction' in prisma) {
    rows = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`SET TRANSACTION READ ONLY`;
      return read(transaction);
    });
  } else {
    const state = await prisma.$queryRaw<{ readOnly: string }[]>`
      SELECT current_setting('transaction_read_only') AS "readOnly"
    `;
    if (state[0]?.readOnly !== 'on') {
      throw new Error('Traffic review requires an existing read-only transaction');
    }
    rows = await read(prisma);
  }
  const row = rows[0];
  const metrics = (key: string) => row?.groups?.[key] || emptyMetrics();
  return {
    version: 1,
    mode: 'parallel',
    rule: 'session_explicit_markers_then_legacy_inference_pending_v1',
    visitorGroupsOverlap: true,
    humanCountAvailable: false,
    recorded: metrics('recorded'),
    legacy: metrics('legacy'),
    candidate: metrics('candidate'),
    explicitExcluded: metrics('explicitExcluded'),
    pendingReview: metrics('pendingReview'),
    unclassified: metrics('unclassified'),
    reasons: [
      'known_bot_agent',
      'automation_marker',
      'manual_qa',
      'internal_traffic',
      'behavior_network_inference',
    ].map((reason) => ({ reason, ...metrics(reason) })),
    evidenceGaps: row?.gaps || {},
    serverSubmissions: row?.submissions || {
      recorded: 0,
      candidate: 0,
      legacy: 0,
      manualQaExcluded: 0,
    },
    anomalyDays: ['2026-09-16', '2026-09-24']
      .filter((date) => date >= startDay && date <= endDay)
      .map((date) => ({
        date,
        status: 'collection_anomaly',
        completeness: 'uncertain',
        comparisonEligible: false,
      })),
  };
}
