CREATE TYPE "InquiryNotificationStatus" AS ENUM (
    'pending',
    'sending',
    'sent',
    'failed',
    'unknown',
    'legacy_unknown'
);

ALTER TABLE "CustomRequirement"
    ADD COLUMN "submissionId" UUID DEFAULT gen_random_uuid(),
    ADD COLUMN "clientIdempotencyKey" VARCHAR(120),
    ADD COLUMN "projectType" VARCHAR(120),
    ADD COLUMN "projectLocation" VARCHAR(180),
    ADD COLUMN "email" VARCHAR(254),
    ADD COLUMN "preferredContact" VARCHAR(20),
    ADD COLUMN "locale" VARCHAR(10),
    ADD COLUMN "pagePath" VARCHAR(500),
    ADD COLUMN "pageTitle" VARCHAR(255),
    ADD COLUMN "pageType" VARCHAR(80),
    ADD COLUMN "productTag" VARCHAR(120),
    ADD COLUMN "sourceType" VARCHAR(120),
    ADD COLUMN "sourceDetail" VARCHAR(120),
    ADD COLUMN "landingPage" VARCHAR(500),
    ADD COLUMN "previousPage" VARCHAR(500),
    ADD COLUMN "utmSource" VARCHAR(120),
    ADD COLUMN "utmMedium" VARCHAR(120),
    ADD COLUMN "utmCampaign" VARCHAR(255),
    ADD COLUMN "discoverySource" VARCHAR(120),
    ADD COLUMN "sessionId" VARCHAR(120),
    ADD COLUMN "visitorId" VARCHAR(120),
    ADD COLUMN "notificationStatus" "InquiryNotificationStatus",
    ADD COLUMN "notificationAttemptCount" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "notificationLastError" VARCHAR(500),
    ADD COLUMN "notificationSentAt" TIMESTAMP(3),
    ADD COLUMN "notificationNextAttemptAt" TIMESTAMP(3),
    ADD COLUMN "notificationLeaseUntil" TIMESTAMP(3);

-- The UUID default backfills existing rows and lets the previous backend version keep inserting
-- while an application rollout is in progress. Keep the column nullable in this migration so the
-- old version can also be rolled back without a coordinated schema rollback.
UPDATE "CustomRequirement"
SET "notificationStatus" = 'legacy_unknown';

ALTER TABLE "CustomRequirement"
    ALTER COLUMN "notificationStatus" SET NOT NULL,
    ALTER COLUMN "notificationStatus" SET DEFAULT 'legacy_unknown';

CREATE UNIQUE INDEX "CustomRequirement_submissionId_key"
    ON "CustomRequirement"("submissionId");
CREATE UNIQUE INDEX "CustomRequirement_clientIdempotencyKey_key"
    ON "CustomRequirement"("clientIdempotencyKey");
CREATE INDEX "CustomRequirement_notification_due_idx"
    ON "CustomRequirement"("notificationStatus", "notificationNextAttemptAt");

ALTER TABLE "WebsiteLeadEvent"
    ADD COLUMN "submissionId" UUID;

CREATE UNIQUE INDEX "WebsiteLeadEvent_submissionId_key"
    ON "WebsiteLeadEvent"("submissionId");

ALTER TABLE "WebsiteLeadEvent"
    ADD CONSTRAINT "WebsiteLeadEvent_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "CustomRequirement"("submissionId")
    ON DELETE RESTRICT ON UPDATE CASCADE;
