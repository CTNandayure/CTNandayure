-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('SURF', 'HIKING', 'CULTURE', 'AGROTOURISM', 'GASTRONOMY', 'WILDLIFE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityScheduleType" AS ENUM ('SPECIFIC_DATE', 'RECURRING');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('BORRADOR', 'PUBLICADA', 'INACTIVA');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "customCategory" VARCHAR(60),
    "durationMinutes" INTEGER NOT NULL,
    "requirements" VARCHAR(1000),
    "scheduleType" "ActivityScheduleType" NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "daysOfWeek" INTEGER[],
    "startTime" VARCHAR(5) NOT NULL,
    "meetingPoint" VARCHAR(500) NOT NULL,
    "meetingLatitude" DOUBLE PRECISION,
    "meetingLongitude" DOUBLE PRECISION,
    "imageUrl" VARCHAR(500),
    "status" "ActivityStatus" NOT NULL DEFAULT 'BORRADOR',
    "publishedAt" TIMESTAMP(3),
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activities_slug_key" ON "activities"("slug");

-- CreateIndex
CREATE INDEX "activities_businessId_idx" ON "activities"("businessId");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "activities"("status");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
