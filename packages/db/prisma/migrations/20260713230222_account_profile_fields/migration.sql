-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "securityAlertsEnabled" BOOLEAN NOT NULL DEFAULT true;
