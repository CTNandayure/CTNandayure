-- AlterTable: add applicantEmail with a temporary default for existing rows, then drop the default
ALTER TABLE "business_requests" ADD COLUMN "applicantEmail" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE "business_requests" ALTER COLUMN "applicantEmail" DROP DEFAULT;
