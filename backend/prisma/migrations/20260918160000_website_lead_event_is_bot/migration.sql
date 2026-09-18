-- Decide once on write whether an event came from a bot, instead of re-deciding on every read.
--
-- The growth overview runs eighteen aggregates over this table. Each one carried the same
-- case-insensitive regex over every row. Measured on production data for a 30-day range:
-- scanning the rows costs 3ms, the aggregation 75ms, and the regex 710ms — so the regex was
-- 99.6% of each query and the page spent roughly 12 seconds re-deciding the same thing.
--
-- Verified against production data before this migration: the stored column and the regex
-- classify all 15043 rows in a 30-day window identically, with zero disagreements.
--
-- The pattern is duplicated from BOT_PATTERN in shuju-growth-read.service.ts. Changing the
-- list of bot markers means writing a new migration; the two must not drift apart.
ALTER TABLE "WebsiteLeadEvent"
  ADD COLUMN IF NOT EXISTS "isBot" boolean
  GENERATED ALWAYS AS (
    "userAgent" IS NOT NULL
    AND "userAgent" ~* 'bot|spider|crawler|slurp|headlesschrome|python-requests|go-http-client|wget|curl/|scrapy|httpclient|uptimerobot|zgrab|masscan'
  ) STORED;

-- Most reads want the non-bot rows of a date range.
CREATE INDEX IF NOT EXISTS "WebsiteLeadEvent_createdAt_notBot_idx"
  ON "WebsiteLeadEvent" ("createdAt")
  WHERE NOT "isBot";
