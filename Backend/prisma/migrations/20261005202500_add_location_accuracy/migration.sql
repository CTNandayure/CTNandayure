-- AlterTable
ALTER TABLE "business_requests" ADD COLUMN IF NOT EXISTS "accuracy" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "accuracy" DOUBLE PRECISION;

