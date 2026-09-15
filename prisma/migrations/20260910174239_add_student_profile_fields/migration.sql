/*
  Warnings:

  - You are about to drop the column `gfgScore` on the `DailySnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `gfg` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gfgScore` on the `StudentStats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DailySnapshot" DROP COLUMN "gfgScore",
ADD COLUMN     "codechefSolved" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "gfg",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "StudentStats" DROP COLUMN "gfgScore",
ADD COLUMN     "codechefGlobalRank" TEXT,
ADD COLUMN     "codechefSolved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codechefStars" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");
