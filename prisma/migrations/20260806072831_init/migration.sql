-- AlterTable
ALTER TABLE "StudentStats" ADD COLUMN     "codeforcesAvatar" TEXT,
ADD COLUMN     "codeforcesContribution" INTEGER,
ADD COLUMN     "codeforcesMaxRank" TEXT,
ADD COLUMN     "codeforcesRank" TEXT,
ADD COLUMN     "codeforcesSolved" INTEGER NOT NULL DEFAULT 0;
