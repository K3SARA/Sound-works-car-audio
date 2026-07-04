-- Replace the raw cuid `invoiceNumber` with a proper sequential invoice number
-- (formatted as INV-000001 etc. in the app). Existing invoices are backfilled
-- in chronological order by invoice date.

ALTER TABLE "Invoice" ADD COLUMN "sequence" INTEGER;

WITH ordered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "date" ASC) AS rn
  FROM "Invoice"
)
UPDATE "Invoice"
SET "sequence" = ordered.rn
FROM ordered
WHERE "Invoice"."id" = ordered."id";

CREATE SEQUENCE IF NOT EXISTS "Invoice_sequence_seq";
SELECT setval('"Invoice_sequence_seq"', COALESCE((SELECT MAX("sequence") FROM "Invoice"), 0) + 1, false);

ALTER TABLE "Invoice" ALTER COLUMN "sequence" SET DEFAULT nextval('"Invoice_sequence_seq"');
ALTER TABLE "Invoice" ALTER COLUMN "sequence" SET NOT NULL;
ALTER SEQUENCE "Invoice_sequence_seq" OWNED BY "Invoice"."sequence";

CREATE UNIQUE INDEX "Invoice_sequence_key" ON "Invoice"("sequence");

ALTER TABLE "Invoice" DROP COLUMN "invoiceNumber";
