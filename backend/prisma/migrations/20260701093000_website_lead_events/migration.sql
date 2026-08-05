CREATE TABLE "WebsiteLeadEvent" (
    "id" SERIAL PRIMARY KEY,
    "eventType" VARCHAR(40) NOT NULL,
    "pageTitle" VARCHAR(255),
    "pagePath" VARCHAR(500),
    "pageType" VARCHAR(80),
    "productTag" VARCHAR(120),
    "sourceType" VARCHAR(120),
    "searchKeyword" VARCHAR(255),
    "province" VARCHAR(120),
    "city" VARCHAR(120),
    "deviceType" VARCHAR(40),
    "landingPage" VARCHAR(500),
    "previousPage" VARCHAR(500),
    "sessionId" VARCHAR(120),
    "visitorId" VARCHAR(120),
    "ipMasked" VARCHAR(80),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "WebsiteLeadEvent_eventType_createdAt_idx" ON "WebsiteLeadEvent" ("eventType", "createdAt");
CREATE INDEX "WebsiteLeadEvent_createdAt_idx" ON "WebsiteLeadEvent" ("createdAt");
CREATE INDEX "WebsiteLeadEvent_pagePath_idx" ON "WebsiteLeadEvent" ("pagePath");
