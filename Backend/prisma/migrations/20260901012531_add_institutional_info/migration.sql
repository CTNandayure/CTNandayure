-- CreateTable
CREATE TABLE "institutional_info" (
    "id" SERIAL NOT NULL,
    "aboutTitle" TEXT NOT NULL,
    "aboutText" TEXT NOT NULL,
    "historyText" TEXT NOT NULL,
    "missionText" TEXT NOT NULL,
    "visionText" TEXT NOT NULL,
    "aboutImageUrl" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "officeHours" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutional_info_pkey" PRIMARY KEY ("id")
);
