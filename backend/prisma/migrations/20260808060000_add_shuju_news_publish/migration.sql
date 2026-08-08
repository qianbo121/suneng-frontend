CREATE TABLE "ShujuNewsPublication" (
    "sourceDraftId" INTEGER NOT NULL,
    "newsId" INTEGER NOT NULL,
    "sourceVersion" INTEGER NOT NULL,
    "payloadSha256" CHAR(64) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "lastIdempotencyKey" VARCHAR(160) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShujuNewsPublication_pkey" PRIMARY KEY ("sourceDraftId")
);

CREATE TABLE "ShujuNewsOperation" (
    "id" SERIAL NOT NULL,
    "idempotencyKey" VARCHAR(160) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "sourceDraftId" INTEGER NOT NULL,
    "sourceVersion" INTEGER NOT NULL,
    "payloadSha256" CHAR(64) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "newsId" INTEGER,
    "requestId" VARCHAR(128),
    "errorCode" VARCHAR(80),
    "errorMessage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShujuNewsOperation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShujuNewsMedia" (
    "sha256" CHAR(64) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "originalName" VARCHAR(255),
    "contentType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShujuNewsMedia_pkey" PRIMARY KEY ("sha256")
);

CREATE UNIQUE INDEX "ShujuNewsPublication_newsId_key" ON "ShujuNewsPublication"("newsId");
CREATE UNIQUE INDEX "ShujuNewsPublication_lastIdempotencyKey_key" ON "ShujuNewsPublication"("lastIdempotencyKey");
CREATE INDEX "ShujuNewsPublication_status_updatedAt_idx" ON "ShujuNewsPublication"("status", "updatedAt");
CREATE UNIQUE INDEX "ShujuNewsOperation_idempotencyKey_key" ON "ShujuNewsOperation"("idempotencyKey");
CREATE INDEX "ShujuNewsOperation_sourceDraftId_createdAt_idx" ON "ShujuNewsOperation"("sourceDraftId", "createdAt");
CREATE INDEX "ShujuNewsOperation_status_updatedAt_idx" ON "ShujuNewsOperation"("status", "updatedAt");

ALTER TABLE "ShujuNewsPublication" ADD CONSTRAINT "ShujuNewsPublication_newsId_fkey"
FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
