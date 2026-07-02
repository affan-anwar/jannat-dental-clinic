-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "awards" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "degrees" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "education" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "memberships" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "websiteUrl" TEXT;
