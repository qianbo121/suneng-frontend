ALTER TABLE "WebsiteLeadEvent"
    ADD COLUMN "sourceDetail" VARCHAR(120),
    ADD COLUMN "utmSource" VARCHAR(120),
    ADD COLUMN "utmMedium" VARCHAR(120),
    ADD COLUMN "utmCampaign" VARCHAR(255),
    ADD COLUMN "discoverySource" VARCHAR(120);

CREATE INDEX "WebsiteLeadEvent_sourceType_sourceDetail_createdAt_idx"
    ON "WebsiteLeadEvent" ("sourceType", "sourceDetail", "createdAt");
