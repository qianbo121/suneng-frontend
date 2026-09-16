-- Supports first-entry lookup and same-visit content attribution without scanning all history.
CREATE INDEX IF NOT EXISTS "WebsiteLeadEvent_sessionId_createdAt_idx"
ON "WebsiteLeadEvent"("sessionId", "createdAt");
