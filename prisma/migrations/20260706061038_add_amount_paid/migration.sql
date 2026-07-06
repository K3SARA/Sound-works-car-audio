-- Credit billing: an invoice is "credit" / partially paid whenever amountPaid < totalAmount.
ALTER TABLE "Invoice" ADD COLUMN "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Existing invoices were completed under the old cash-only flow — treat them as fully paid.
UPDATE "Invoice" SET "amountPaid" = "totalAmount";
