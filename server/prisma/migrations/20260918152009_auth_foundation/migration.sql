-- AlterTable
ALTER TABLE "RequesterUser" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passwordHash" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'Requester';
