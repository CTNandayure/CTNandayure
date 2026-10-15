-- AlterTable
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(160);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "businesses_slug_key" ON "businesses"("slug");

