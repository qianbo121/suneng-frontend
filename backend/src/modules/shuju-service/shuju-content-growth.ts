import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export type ContentGrowthPage = {
  pagePath: string;
  pageTitle: string | null;
  pageType: string | null;
  visitors: number;
  pageViews: number;
  contacts: number;
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
    notBot: Prisma.Sql;
    verified: Prisma.Sql;
    sourceType: Prisma.Sql;
    sourceDetail: Prisma.Sql;
  },
) {
  const rows = await prisma.$queryRaw<{ payload: Payload }[]>(Prisma.sql`
    WITH content_events AS MATERIALIZED (
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
        AND ${scope.notBot} AND ${scope.verified}
    ), matched AS MATERIALIZED (
      SELECT * FROM content_events WHERE ${scope.dimensionWhere}
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
          WHERE ev."sessionId" = v.session_key AND ev."eventType" = 'page_view' AND ${scope.notBot}
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
    ), page_metrics AS (
      SELECT m.path,
        MAX(m."pageTitle") FILTER (WHERE m."eventType" = 'page_view') AS title,
        MAX(m."pageType") FILTER (WHERE m."eventType" = 'page_view') AS page_type,
        COUNT(DISTINCT m.identity) FILTER (WHERE m."eventType" = 'page_view') AS visitors,
        COUNT(*) FILTER (WHERE m."eventType" = 'page_view') AS page_views,
        COUNT(DISTINCT m.identity) FILTER (WHERE m."eventType" IN
          ('phone_click','wechat_click','wechat_qr_view','quote_cta_click','email_click')) AS contacts,
        COUNT(DISTINCT m."submissionId") FILTER (WHERE m."eventType" = 'form_submit') AS direct_submissions,
        COUNT(*) FILTER (WHERE m."eventType" = 'page_view' AND m.session_key IS NULL) AS unidentified_views,
        COUNT(DISTINCT m."submissionId") FILTER (WHERE m."eventType" = 'form_submit' AND NOT EXISTS (
          SELECT 1 FROM associations a WHERE a.path = m.path AND a."submissionId" = m."submissionId"
        )) AS unlinked_direct
      FROM matched m WHERE m.path IS NOT NULL GROUP BY m.path
    ), entry_counts AS (
      SELECT path, COUNT(*) AS visits FROM entries GROUP BY path
    ), association_counts AS (
      SELECT path, COUNT(*) AS total,
        COUNT(*) FILTER (WHERE submitted_path IS DISTINCT FROM path) AS cross_page
      FROM associations GROUP BY path
    ), ranked AS (
      SELECT p.*, COALESCE(e.visits, 0) AS entry_visits,
        COALESCE(a.total, 0) + p.unlinked_direct AS associated,
        COALESCE(a.cross_page, 0) AS cross_page
      FROM page_metrics p LEFT JOIN entry_counts e USING(path)
      LEFT JOIN association_counts a USING(path)
      ORDER BY entry_visits DESC, visitors DESC, path LIMIT 200
    ), entry_daily AS (
      SELECT path, TO_CHAR("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day,
        COUNT(*) AS visits FROM entries GROUP BY path, day
    ), entry_sources AS (
      -- Source normalisation runs here, on entry rows only. Computing it for every event
      -- meant nine domain regexes over rows whose source is never reported.
      SELECT path, ${scope.sourceType} AS source_type, ${scope.sourceDetail} AS source_detail,
        COUNT(*) AS visits FROM entries
      GROUP BY path, 2, 3
    ), global_daily AS (
      SELECT day, SUM(visits) AS visits FROM entry_daily GROUP BY day
    ), global_sources AS (
      SELECT source_type, SUM(visits) AS visits FROM entry_sources GROUP BY source_type
    ), scoped_submissions AS (
      SELECT "submissionId" FROM matched WHERE "eventType" = 'form_submit'
      UNION SELECT "submissionId" FROM associations
    )
    SELECT JSONB_BUILD_OBJECT(
      'pages', COALESCE((SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'pagePath', r.path, 'pageTitle', r.title, 'pageType', r.page_type,
        'visitors', r.visitors, 'pageViews', r.page_views, 'contacts', r.contacts,
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
            WHERE ev."sessionId" = v.session_key AND ev."eventType" = 'page_view' AND ${scope.notBot}
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
    pageLimit: 200,
    ...rows[0]?.payload,
  };
}
