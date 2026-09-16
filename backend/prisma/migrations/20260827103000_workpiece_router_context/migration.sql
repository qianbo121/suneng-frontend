CREATE TABLE "WorkpieceSelection" (
  "id" SERIAL NOT NULL,
  "sessionId" VARCHAR(120),
  "categoryId" VARCHAR(120) NOT NULL,
  "workpieceId" VARCHAR(120),
  "searchTerm" VARCHAR(255),
  "processPurposeId" VARCHAR(120),
  "logicUnitId" VARCHAR(120),
  "rawConditionsJson" JSONB NOT NULL,
  "displayState" VARCHAR(40) NOT NULL,
  "missingInputsJson" JSONB,
  "publicDirectionIdsJson" JSONB,
  "ruleVersion" VARCHAR(120) NOT NULL,
  "baselineVersion" VARCHAR(120),
  "pagePath" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkpieceSelection_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CustomRequirement"
  ADD COLUMN "workpieceSelectionId" INTEGER;

ALTER TABLE "WebsiteLeadEvent"
  ADD COLUMN "properties" JSONB;

CREATE UNIQUE INDEX "CustomRequirement_workpieceSelectionId_key"
  ON "CustomRequirement"("workpieceSelectionId");

CREATE INDEX "WorkpieceSelection_workpieceId_createdAt_idx"
  ON "WorkpieceSelection"("workpieceId", "createdAt");

CREATE INDEX "WorkpieceSelection_displayState_createdAt_idx"
  ON "WorkpieceSelection"("displayState", "createdAt");

CREATE INDEX "WorkpieceSelection_sessionId_createdAt_idx"
  ON "WorkpieceSelection"("sessionId", "createdAt");

ALTER TABLE "CustomRequirement"
  ADD CONSTRAINT "CustomRequirement_workpieceSelectionId_fkey"
  FOREIGN KEY ("workpieceSelectionId") REFERENCES "WorkpieceSelection"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
