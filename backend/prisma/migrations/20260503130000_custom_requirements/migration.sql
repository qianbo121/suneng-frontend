CREATE TYPE "CustomRequirementStatus" AS ENUM ('pending', 'followed');

CREATE TABLE "CustomRequirement" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120),
    "phone" VARCHAR(50) NOT NULL,
    "company" VARCHAR(180),
    "industry" VARCHAR(180),
    "process" VARCHAR(180),
    "temperature" VARCHAR(120),
    "requirement" TEXT,
    "status" "CustomRequirementStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRequirement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomRequirement_status_createdAt_idx" ON "CustomRequirement"("status", "createdAt");
CREATE INDEX "CustomRequirement_phone_idx" ON "CustomRequirement"("phone");
CREATE INDEX "CustomRequirement_createdAt_idx" ON "CustomRequirement"("createdAt");
