-- DropIndex
DROP INDEX "Portfolio_userId_key";

-- DropIndex
DROP INDEX "Portfolio_username_key";

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Untitled Portfolio';

-- CreateIndex
CREATE INDEX "Portfolio_userId_idx" ON "Portfolio"("userId");

-- CreateIndex
CREATE INDEX "Portfolio_username_published_idx" ON "Portfolio"("username", "published");
