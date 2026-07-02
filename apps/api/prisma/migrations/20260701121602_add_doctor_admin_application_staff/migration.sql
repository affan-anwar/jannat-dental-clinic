-- CreateEnum
CREATE TYPE "DoctorApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CHANGES');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DOCTOR_ADMIN';

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "adminDoctorId" TEXT;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "signatureUrl" TEXT;

-- CreateTable
CREATE TABLE "DoctorApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clinicName" TEXT NOT NULL,
    "clinicPhone" TEXT,
    "clinicEmail" TEXT,
    "clinicAddressLine1" TEXT,
    "clinicAddressLine2" TEXT,
    "clinicCity" TEXT,
    "clinicState" TEXT,
    "clinicPostalCode" TEXT,
    "clinicCountry" TEXT NOT NULL DEFAULT 'India',
    "qualification" TEXT,
    "specialization" TEXT,
    "registrationNumber" TEXT,
    "experienceYears" INTEGER,
    "biography" TEXT,
    "profilePhotoUrl" TEXT,
    "registrationDocUrl" TEXT,
    "degreeDocUrl" TEXT,
    "identityDocUrl" TEXT,
    "status" "DoctorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "designation" TEXT,
    "employeeCode" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorApplication_userId_key" ON "DoctorApplication"("userId");

-- CreateIndex
CREATE INDEX "DoctorApplication_status_createdAt_idx" ON "DoctorApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DoctorApplication_reviewedById_idx" ON "DoctorApplication"("reviewedById");

-- CreateIndex
CREATE INDEX "DoctorApplication_registrationNumber_idx" ON "DoctorApplication"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");

-- CreateIndex
CREATE INDEX "StaffProfile_clinicId_idx" ON "StaffProfile"("clinicId");

-- CreateIndex
CREATE INDEX "StaffProfile_employeeCode_idx" ON "StaffProfile"("employeeCode");

-- CreateIndex
CREATE INDEX "Clinic_adminDoctorId_idx" ON "Clinic"("adminDoctorId");

-- CreateIndex
CREATE INDEX "Clinic_city_state_idx" ON "Clinic"("city", "state");

-- CreateIndex
CREATE INDEX "Doctor_fullName_idx" ON "Doctor"("fullName");

-- CreateIndex
CREATE INDEX "DoctorService_serviceId_idx" ON "DoctorService"("serviceId");

-- AddForeignKey
ALTER TABLE "DoctorApplication" ADD CONSTRAINT "DoctorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorApplication" ADD CONSTRAINT "DoctorApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_adminDoctorId_fkey" FOREIGN KEY ("adminDoctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
