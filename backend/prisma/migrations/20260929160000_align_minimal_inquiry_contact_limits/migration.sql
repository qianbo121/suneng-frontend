-- Preserve the complete identity/contact accepted by the homepage inquiry contract.
-- Widening only: existing rows and the stricter full-form limits remain unchanged.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
ALTER TABLE "CustomRequirement"
  ALTER COLUMN "name" TYPE VARCHAR(180),
  ALTER COLUMN "phone" TYPE VARCHAR(254);
COMMIT;
