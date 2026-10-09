import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { InquiryReviewDto } from './dto/shuju-growth-overview.dto';

export type OperatingInquiryCounts = {
  raw: number;
  valid: number | null;
  excluded: number | null;
  pending: number | null;
  unknown: number | null;
};

export type OperatingSource = {
  sourceType: string;
  sourceDetail: string | null;
  visits: number;
  dwell20Visitors: number;
  contactVisitors: number;
  rawSubmissions: number;
  validSubmissions: number | null;
  pendingSubmissions: number | null;
  excludedSubmissions: number | null;
  unknownSubmissions: number | null;
};

export type ContentGrowthPage = {
  pagePath: string;
  pageTitle: string | null;
  pageType: string | null;
  visitors: number;
  pageViews: number;
  contacts: number;
  contactVisitors: number;
  dwell20EntryVisitors: number;
  validDirectSubmissions: number | null;
  validAssociatedSubmissions: number | null;
  validCrossPageSubmissions: number | null;
  directSubmissions: number;
  entryVisits: number;
  associatedSubmissions: number;
  crossPageSubmissions: number;
  unlinkedDirectSubmissions: number;
  unidentifiedPageViews: number;
  daily: { date: string; visits: number }[];
  sources: { sourceType: string; sourceDetail: string | null; visits: number }[];
};

type Payload = {
  operating: { version: number; contactVisitors: number; inquiries: OperatingInquiryCounts };
  operatingSources: OperatingSource[];
  operatingSourceDetails: OperatingSource[];
  pages: ContentGrowthPage[];
  totalPages: number;
  entryVisits: number;
  submissions: number;
  unlinkedSubmissions: number;
  unidentifiedPageViews: number;
  uncertainEntryVisits: number;
  daily: { date: string; visits: number }[];
  sources: { sourceType: string; visits: number }[];
};

/** Aggregate only. Anonymous identities and inquiry contents never leave the database. */
export async function readContentGrowth(
  prisma: PrismaService,
  scope: {
    start: Date;
    end: Date;
    /** Dimension conditions only. Time, bot and verified-event filtering happens once, below. */
    dimensionWhere: Prisma.Sql;
    trafficFilter: (alias: string) => Prisma.Sql;
    verified: Prisma.Sql;
    sourceType: Prisma.Sql;
    sourceDetail: Prisma.Sql;
    inquiryReview?: InquiryReviewDto;
  },
) {
  const reviewed = scope.inquiryReview !== undefined;
  const reviewRows = [
    ...(scope.inquiryReview?.excludedIds || []).map((id) => ({ id, status: 'excluded' })),
    ...(scope.inquiryReview?.validIds || []).map((id) => ({ id, status: 'valid' })),
    ...(scope.inquiryReview?.pendingIds || []).map((id) => ({ id, status: 'pending' })),
  ];
  const rows = await prisma.$queryRaw<{ payload: Payload }[]>(Prisma.sql`
    WITH review_items AS (
      SELECT * FROM JSONB_TO_RECORDSET(${JSON.stringify(reviewRows)}::jsonb) AS r(id int, status text)
    ), content_events AS MATERIALIZED (
      -- Only the columns used below. Carrying every column (properties jsonb included)
      -- through four materialized stages costs several megabytes of temporary writes.
      -- "userAgent" is deliberately dropped here: the entry lookup below filters bots on
      -- its own copy of the table, and keeping the column would make that unqualified
      -- reference ambiguous with the outer row.
      SELECT id, "eventType", "pageTitle", "pagePath", "pageType", "sourceType", "sourceDetail",
        "deviceType", "landingPage", "sessionId", "visitorId", "createdAt", "submissionId",
        NULLIF(REGEXP_REPLACE(SPLIT_PART(SPLIT_PART("pagePath", '?', 1), '#', 1), '/+$', ''), '') AS path,
        NULLIF(REGEXP_REPLACE(SPLIT_PART(SPLIT_PART("landingPage", '?', 1), '#', 1), '/+$', ''), '') AS landing,
        NULLIF("sessionId", '') AS session_key,
        COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || id::text) AS identity
      FROM "WebsiteLeadEvent"
      WHERE "createdAt" >= ${scope.start} AND "createdAt" < ${scope.end}
        AND ${scope.trafficFilter('WebsiteLeadEvent')} AND ${scope.verified}
    ), matched AS MATERIALIZED (
      -- Normalise only matched events, once, for the new source operating metrics.
      SELECT *, ${scope.sourceType} AS source_type, ${scope.sourceDetail} AS source_detail
      FROM content_events WHERE ${scope.dimensionWhere}
    ), views AS MATERIALIZED (
      SELECT * FROM matched WHERE "eventType" = 'page_view' AND path IS NOT NULL
    ), entries AS MATERIALIZED (
      -- Each candidate looks up its own visit's first recorded page view through the
      -- (sessionId, createdAt) index, including views before the selected period.
      -- A visit spanning midnight must not become a second entry on the following day.
      -- Matching against a CTE of first views instead makes the planner estimate one row
      -- and fall back to a nested loop — 27 million row comparisons on a 30-day range.
      SELECT v.* FROM views v
      WHERE (v.landing IS NULL OR v.path = v.landing)
        AND v.id = (
          SELECT ev.id FROM "WebsiteLeadEvent" ev
          WHERE ev."sessionId" = v.session_key AND ev."eventType" = 'page_view' AND ${scope.trafficFilter('ev')}
          ORDER BY ev."createdAt", ev.id LIMIT 1
        )
    ), submissions AS MATERIALIZED (
      SELECT * FROM content_events
      WHERE "eventType" = 'form_submit' AND "submissionId" IS NOT NULL
    ), associations AS MATERIALIZED (
      -- Both the read and submission belong to the selected period; same visit only.
      -- A page read after the submission, or in another visit by the same visitor, is not evidence.
      SELECT DISTINCT v.path, s."submissionId", s.path AS submitted_path
      FROM views v JOIN submissions s ON s.session_key = v.session_key
        AND s."createdAt" >= v."createdAt"
        AND (s."visitorId" IS NULL OR v."visitorId" IS NULL OR s."visitorId" = v."visitorId")
      WHERE v.session_key IS NOT NULL
    ), scoped_submissions AS MATERIALIZED (
      SELECT "submissionId" FROM matched WHERE "eventType" = 'form_submit'
      UNION SELECT "submissionId" FROM associations
    ), reviewed_submissions AS MATERIALIZED (
      -- Event UUIDs identify submissions, whereas the internal review lists contain inquiry row IDs.
      -- Missing records and rows not reviewed by the caller remain unknown, never implicitly valid.
      SELECT s."submissionId", COALESCE(r.status, 'unknown') AS review_status
      FROM scoped_submissions s
      LEFT JOIN "CustomRequirement" c ON c."submissionId" = s."submissionId"
      LEFT JOIN review_items r ON r.id = c.id
    ), page_metrics AS (
      SELECT m.path,
        MAX(m."pageTitle") FILTER (WHERE m."eventType" = 'page_view') AS title,
        MAX(m."pageType") FILTER (WHERE m."eventType" = 'page_view') AS page_type,
        COUNT(DISTINCT m.identity) FILTER (WHERE m."eventType" = 'page_view') AS visitors,
        COUNT(*) FILTER (WHERE m."eventType" = 'page_view') AS page_views,
        COUNT(DISTINCT m.identity) FILTER (WHERE m."eventType" IN
          ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click')) AS contacts,
        COUNT(DISTINCT m.identity) FILTER (WHERE m."eventType" IN
          ('phone_click','wechat_click','wechat_qr_view','email_click')) AS contact_visitors,
        COUNT(DISTINCT m."submissionId") FILTER (WHERE m."eventType" = 'form_submit') AS direct_submissions,
        COUNT(DISTINCT m."submissionId") FILTER (WHERE m."eventType" = 'form_submit'
          AND rs.review_status = 'valid') AS valid_direct_submissions,
        COUNT(*) FILTER (WHERE m."eventType" = 'page_view' AND m.session_key IS NULL) AS unidentified_views,
        COUNT(DISTINCT m."submissionId") FILTER (WHERE m."eventType" = 'form_submit' AND NOT EXISTS (
          SELECT 1 FROM associations a WHERE a.path = m.path AND a."submissionId" = m."submissionId"
        )) AS unlinked_direct,
        COUNT(DISTINCT m."submissionId") FILTER (WHERE m."eventType" = 'form_submit'
          AND rs.review_status = 'valid' AND NOT EXISTS (
            SELECT 1 FROM associations a WHERE a.path = m.path AND a."submissionId" = m."submissionId"
          )) AS valid_unlinked_direct
      FROM matched m LEFT JOIN reviewed_submissions rs ON rs."submissionId" = m."submissionId"
      WHERE m.path IS NOT NULL GROUP BY m.path
    ), dwell_events AS MATERIALIZED (
      -- Keep repeated visit matching on the small, narrow dwell set, not all event payloads.
      SELECT session_key, "createdAt", "visitorId" FROM content_events
      WHERE "eventType" = 'dwell_20s'
    ), qualified_entry_ids AS MATERIALIZED (
      -- Calculate the unique entry set once: older planners can severely underestimate entries
      -- and otherwise inline this whole join into a nested loop for each entry being counted.
      SELECT DISTINCT e.id
      FROM entries e JOIN dwell_events d
        ON d.session_key = e.session_key
        AND d."createdAt" >= e."createdAt"
        AND (d."visitorId" IS NULL OR e."visitorId" IS NULL OR d."visitorId" = e."visitorId")
    ), entry_counts AS (
      SELECT e.path, COUNT(*) AS visits,
        COUNT(DISTINCT e.identity) FILTER (WHERE q.id IS NOT NULL) AS dwell20_entry_visitors
      FROM entries e LEFT JOIN qualified_entry_ids q ON q.id = e.id
      GROUP BY e.path
    ), association_counts AS (
      SELECT a.path, COUNT(*) AS total,
        COUNT(*) FILTER (WHERE a.submitted_path IS DISTINCT FROM a.path) AS cross_page,
        COUNT(*) FILTER (WHERE rs.review_status = 'valid') AS valid_total,
        COUNT(*) FILTER (WHERE rs.review_status = 'valid'
          AND a.submitted_path IS DISTINCT FROM a.path) AS valid_cross_page
      FROM associations a JOIN reviewed_submissions rs ON rs."submissionId" = a."submissionId"
      GROUP BY a.path
    ), ranked AS (
      SELECT p.*, COALESCE(e.visits, 0) AS entry_visits,
        COALESCE(e.dwell20_entry_visitors, 0) AS dwell20_entry_visitors,
        COALESCE(a.total, 0) + p.unlinked_direct AS associated,
        COALESCE(a.cross_page, 0) AS cross_page,
        COALESCE(a.valid_total, 0) + p.valid_unlinked_direct AS valid_associated,
        COALESCE(a.valid_cross_page, 0) AS valid_cross_page
      FROM page_metrics p LEFT JOIN entry_counts e USING(path)
      LEFT JOIN association_counts a USING(path)
      -- Return the entire filtered set so title search and alternate rankings cannot omit tail pages.
      ORDER BY entry_visits DESC, visitors DESC, path
    ), entry_daily AS (
      SELECT path, TO_CHAR("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day,
        COUNT(*) AS visits FROM entries GROUP BY path, day
    ), entry_sources AS (
      -- Reuse the normalised source already required by operating metrics.
      SELECT path, source_type, source_detail, COUNT(*) AS visits FROM entries
      GROUP BY path, 2, 3
    ), global_daily AS (
      SELECT day, SUM(visits) AS visits FROM entry_daily GROUP BY day
    ), global_sources AS (
      SELECT source_type, SUM(visits) AS visits FROM entry_sources GROUP BY source_type
    ), submission_sources AS (
      SELECT source_type, source_detail, "submissionId" FROM matched WHERE "eventType" = 'form_submit'
      UNION
      SELECT v.source_type, v.source_detail, a."submissionId"
      FROM associations a JOIN views v ON v.path = a.path
      JOIN submissions s ON s."submissionId" = a."submissionId"
        AND s.session_key = v.session_key AND s."createdAt" >= v."createdAt"
        AND (s."visitorId" IS NULL OR v."visitorId" IS NULL OR s."visitorId" = v."visitorId")
    ), source_facts AS (
      SELECT source_type, source_detail, 'event'::text AS kind, "eventType" AS event_type,
        identity, session_key, NULL::uuid AS submission_id, NULL::text AS review_status
      FROM matched
      UNION ALL
      SELECT s.source_type, s.source_detail, 'inquiry', NULL, NULL, NULL,
        s."submissionId", r.review_status
      FROM submission_sources s JOIN reviewed_submissions r ON r."submissionId" = s."submissionId"
    ), source_metrics AS (
      SELECT source_type, source_detail, GROUPING(source_detail) AS detail_group,
        COUNT(DISTINCT session_key) FILTER (WHERE event_type = 'page_view') AS visits,
        COUNT(DISTINCT identity) FILTER (WHERE event_type = 'dwell_20s') AS dwell20_visitors,
        COUNT(DISTINCT identity) FILTER (WHERE event_type IN
          ('phone_click','wechat_click','wechat_qr_view','email_click')) AS contact_visitors,
        COUNT(DISTINCT submission_id) AS raw_submissions,
        COUNT(DISTINCT submission_id) FILTER (WHERE review_status = 'valid') AS valid,
        COUNT(DISTINCT submission_id) FILTER (WHERE review_status = 'pending') AS pending,
        COUNT(DISTINCT submission_id) FILTER (WHERE review_status = 'excluded') AS excluded,
        COUNT(DISTINCT submission_id) FILTER (WHERE review_status = 'unknown') AS unknown
      FROM source_facts GROUP BY GROUPING SETS ((source_type), (source_type, source_detail))
    ), source_payloads AS (
      SELECT detail_group, source_detail, JSONB_BUILD_OBJECT(
        'sourceType', source_type, 'sourceDetail', source_detail,
        'visits', visits, 'dwell20Visitors', dwell20_visitors, 'contactVisitors', contact_visitors,
        'rawSubmissions', raw_submissions,
        'validSubmissions', CASE WHEN ${reviewed} THEN valid END,
        'pendingSubmissions', CASE WHEN ${reviewed} THEN pending END,
        'excludedSubmissions', CASE WHEN ${reviewed} THEN excluded END,
        'unknownSubmissions', CASE WHEN ${reviewed} THEN unknown END
      ) AS payload FROM source_metrics
    )
    SELECT JSONB_BUILD_OBJECT(
      'operating', JSONB_BUILD_OBJECT('version', 1,
        'contactVisitors', (SELECT COUNT(DISTINCT identity) FROM matched WHERE "eventType" IN
          ('phone_click','wechat_click','wechat_qr_view','email_click')),
        'inquiries', JSONB_BUILD_OBJECT(
          'raw', (SELECT COUNT(*) FROM reviewed_submissions),
          'valid', CASE WHEN ${reviewed} THEN (SELECT COUNT(*) FROM reviewed_submissions WHERE review_status = 'valid') END,
          'excluded', CASE WHEN ${reviewed} THEN (SELECT COUNT(*) FROM reviewed_submissions WHERE review_status = 'excluded') END,
          'pending', CASE WHEN ${reviewed} THEN (SELECT COUNT(*) FROM reviewed_submissions WHERE review_status = 'pending') END,
          'unknown', CASE WHEN ${reviewed} THEN (SELECT COUNT(*) FROM reviewed_submissions WHERE review_status = 'unknown') END
        )),
      'operatingSources', COALESCE((SELECT JSONB_AGG(payload) FROM source_payloads WHERE detail_group = 1), '[]'::jsonb),
      'operatingSourceDetails', COALESCE((SELECT JSONB_AGG(payload) FROM source_payloads
        WHERE detail_group = 0 AND source_detail IS NOT NULL), '[]'::jsonb),
      'pages', COALESCE((SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'pagePath', r.path, 'pageTitle', r.title, 'pageType', r.page_type,
        'visitors', r.visitors, 'pageViews', r.page_views, 'contacts', r.contacts,
        'contactVisitors', r.contact_visitors, 'dwell20EntryVisitors', r.dwell20_entry_visitors,
        'validDirectSubmissions', CASE WHEN ${reviewed} THEN r.valid_direct_submissions END,
        'validAssociatedSubmissions', CASE WHEN ${reviewed} THEN r.valid_associated END,
        'validCrossPageSubmissions', CASE WHEN ${reviewed} THEN r.valid_cross_page END,
        'directSubmissions', r.direct_submissions, 'entryVisits', r.entry_visits,
        'associatedSubmissions', r.associated, 'crossPageSubmissions', r.cross_page,
        'unlinkedDirectSubmissions', r.unlinked_direct, 'unidentifiedPageViews', r.unidentified_views,
        'daily', COALESCE((SELECT JSONB_AGG(JSONB_BUILD_OBJECT('date', d.day, 'visits', d.visits) ORDER BY d.day)
          FROM entry_daily d WHERE d.path = r.path), '[]'::jsonb),
        'sources', COALESCE((SELECT JSONB_AGG(JSONB_BUILD_OBJECT('sourceType', s.source_type,
          'sourceDetail', s.source_detail, 'visits', s.visits) ORDER BY s.visits DESC, s.source_type, s.source_detail)
          FROM entry_sources s WHERE s.path = r.path), '[]'::jsonb)
      ) ORDER BY r.entry_visits DESC, r.visitors DESC, r.path) FROM ranked r), '[]'::jsonb),
      'totalPages', (SELECT COUNT(*) FROM page_metrics),
      'entryVisits', (SELECT COUNT(*) FROM entries),
      'submissions', (SELECT COUNT(*) FROM scoped_submissions),
      'unlinkedSubmissions', (SELECT COUNT(*) FROM scoped_submissions s WHERE NOT EXISTS (
        SELECT 1 FROM associations a WHERE a."submissionId" = s."submissionId"
      )),
      'unidentifiedPageViews', (SELECT COUNT(*) FROM views WHERE session_key IS NULL),
      'uncertainEntryVisits', (SELECT COUNT(*) FROM views v
        WHERE v.landing IS NOT NULL AND v.path <> v.landing
          AND v.id = (
            SELECT ev.id FROM "WebsiteLeadEvent" ev
            WHERE ev."sessionId" = v.session_key AND ev."eventType" = 'page_view' AND ${scope.trafficFilter('ev')}
            ORDER BY ev."createdAt", ev.id LIMIT 1
          )),
      'daily', COALESCE((SELECT JSONB_AGG(JSONB_BUILD_OBJECT('date', day, 'visits', visits) ORDER BY day)
        FROM global_daily), '[]'::jsonb),
      'sources', COALESCE((SELECT JSONB_AGG(JSONB_BUILD_OBJECT('sourceType', source_type, 'visits', visits)
        ORDER BY visits DESC, source_type) FROM global_sources), '[]'::jsonb)
    ) AS payload
  `);
  return {
    version: 1,
    status: rows[0] ? 'available' : 'unavailable',
    attributionRule: 'same_session_read_before_submit_in_range',
    entryRule: 'first_recorded_view_matching_landing',
    pageLimit: null,
    pageScope: 'all_matching',
    ...rows[0]?.payload,
  };
}
