-- Every notification state transition increments this version. Manual actions
-- compare the version they were shown with the current row so that a stale
-- browser cannot act after an ABA state cycle (for example failed -> pending ->
-- sending -> failed).
ALTER TABLE "CustomRequirement"
    ADD COLUMN "notificationStateVersion" INTEGER NOT NULL DEFAULT 0;
