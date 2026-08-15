CREATE TYPE "InquiryNotificationAuditAction" AS ENUM (
    'requeue_failed',
    'confirm_unknown_delivered',
    'confirm_unknown_not_delivered_and_requeue'
);

CREATE TABLE "InquiryNotificationAudit" (
    "id" SERIAL NOT NULL,
    "customRequirementId" INTEGER NOT NULL,
    "submissionId" UUID NOT NULL,
    "operatorAdminUserId" INTEGER NOT NULL,
    "operatorUsername" VARCHAR(80) NOT NULL,
    "operatorRole" "AdminRole" NOT NULL,
    "action" "InquiryNotificationAuditAction" NOT NULL,
    "previousStatus" "InquiryNotificationStatus" NOT NULL,
    "nextStatus" "InquiryNotificationStatus" NOT NULL,
    "previousError" VARCHAR(500),
    "attemptCount" INTEGER NOT NULL,
    "note" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryNotificationAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InquiryNotificationAudit_requirement_created_idx"
    ON "InquiryNotificationAudit"("customRequirementId", "createdAt");
CREATE INDEX "InquiryNotificationAudit_submission_created_idx"
    ON "InquiryNotificationAudit"("submissionId", "createdAt");
CREATE INDEX "InquiryNotificationAudit_operator_created_idx"
    ON "InquiryNotificationAudit"("operatorAdminUserId", "createdAt");

ALTER TABLE "InquiryNotificationAudit"
    ADD CONSTRAINT "InquiryNotificationAudit_customRequirementId_fkey"
    FOREIGN KEY ("customRequirementId") REFERENCES "CustomRequirement"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
