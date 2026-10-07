-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('LODGING', 'FOOD', 'TRANSPORT', 'CRAFTS', 'TOURS', 'AGROTOURISM', 'COMMERCE');

-- CreateEnum
CREATE TYPE "District" AS ENUM ('CARMONA', 'SANTA_RITA', 'ZAPOTAL', 'SAN_PABLO', 'PORVENIR', 'BEJUCO');

-- CreateTable
CREATE TABLE "business_requests" (
    "id" TEXT NOT NULL,
    "businessName" VARCHAR(150) NOT NULL,
    "categories" "BusinessCategory"[],
    "district" "District" NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "facebookUrl" VARCHAR(255),
    "instagramUrl" VARCHAR(255),
    "scheduleText" VARCHAR(500) NOT NULL,
    "coverImageUrl" VARCHAR(500) NOT NULL,
    "galleryUrls" TEXT[],
    "documentUrls" TEXT[],
    "applicantName" VARCHAR(50) NOT NULL,
    "applicantFirstLastname" VARCHAR(100) NOT NULL,
    "applicantSecondLastname" VARCHAR(100) NOT NULL,
    "applicantPhone" VARCHAR(20) NOT NULL,
    "requestStatus" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "businessName" VARCHAR(150) NOT NULL,
    "categories" "BusinessCategory"[],
    "district" "District" NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "facebookUrl" VARCHAR(255),
    "instagramUrl" VARCHAR(255),
    "scheduleText" VARCHAR(500) NOT NULL,
    "coverImageUrl" VARCHAR(500) NOT NULL,
    "galleryUrls" TEXT[],
    "documentUrls" TEXT[],
    "businessStatus" "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "requestId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_requestId_key" ON "businesses"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_userId_key" ON "businesses"("userId");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "business_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id_person") ON DELETE SET NULL ON UPDATE CASCADE;
