/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DoctorRequestedRole" AS ENUM ('DOCTOR_ADMIN', 'DOCTOR');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "applicationId" TEXT,
ADD COLUMN     "availableForBooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3),
ADD COLUMN     "publicEmail" TEXT,
ADD COLUMN     "publicPhone" TEXT,
ADD COLUMN     "registrationCouncil" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- AlterTable
ALTER TABLE "DoctorApplication" ADD COLUMN     "registrationCouncil" TEXT,
ADD COLUMN     "requestedClinicId" TEXT,
ADD COLUMN     "requestedRole" "DoctorRequestedRole" NOT NULL DEFAULT 'DOCTOR',
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DoctorAvailability" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorAvailability_doctorId_dayOfWeek_idx" ON "DoctorAvailability"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorAvailability_doctorId_dayOfWeek_startTime_endTime_key" ON "DoctorAvailability"("doctorId", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_applicationId_key" ON "Doctor"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_slug_key" ON "Doctor"("slug");

-- CreateIndex
CREATE INDEX "Doctor_verifiedById_idx" ON "Doctor"("verifiedById");

-- CreateIndex
CREATE INDEX "Doctor_isVerified_isPublic_isActive_idx" ON "Doctor"("isVerified", "isPublic", "isActive");

-- CreateIndex
CREATE INDEX "DoctorApplication_requestedClinicId_idx" ON "DoctorApplication"("requestedClinicId");

-- AddForeignKey
ALTER TABLE "DoctorApplication" ADD CONSTRAINT "DoctorApplication_requestedClinicId_fkey" FOREIGN KEY ("requestedClinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DoctorApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
