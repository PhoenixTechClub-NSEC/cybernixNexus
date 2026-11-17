/*
  Warnings:

  - You are about to drop the column `gfgScore` on the `DailySnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `gfg` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gfgScore` on the `StudentStats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participantId]` on the table `ContestRegistration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('UPCOMING', 'LIVE', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'ACTIVE', 'DISQUALIFIED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "SubmissionVerdict" AS ENUM ('QUEUED', 'COMPILING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'RUNTIME_ERROR');

-- DropIndex
DROP INDEX "Student_rollNumber_key";

-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "accessCode" TEXT,
ADD COLUMN     "displayRegisteredUsers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableProctoring" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hostedInternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLinkPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxParticipants" INTEGER DEFAULT 50,
ADD COLUMN     "maxTabSwitches" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "prize" TEXT,
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "status" "ContestStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "venue" TEXT;

-- AlterTable
ALTER TABLE "ContestRegistration" ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "dqReason" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "finishTime" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "otpVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "participantId" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
ADD COLUMN     "studentIdNumber" TEXT,
ADD COLUMN     "tabSwitches" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DailySnapshot" DROP COLUMN "gfgScore",
ADD COLUMN     "codechefSolved" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "gfg",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "rollNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentStats" DROP COLUMN "gfgScore",
ADD COLUMN     "codechefFailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codechefGlobalRank" TEXT,
ADD COLUMN     "codechefLastError" TEXT,
ADD COLUMN     "codechefSolved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codechefStars" TEXT,
ADD COLUMN     "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSyncError" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "suspensionUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ContestInfringement" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestInfringement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "inputFormat" TEXT,
    "outputFormat" TEXT,
    "constraints" TEXT,
    "timeLimitMs" INTEGER NOT NULL DEFAULT 1000,
    "memoryLimitMb" INTEGER NOT NULL DEFAULT 256,
    "points" INTEGER NOT NULL DEFAULT 100,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "starterCodes" JSONB,
    "sourcePlatform" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "verdict" "SubmissionVerdict" NOT NULL DEFAULT 'QUEUED',
    "execTimeMs" INTEGER,
    "memoryKb" INTEGER,
    "compileError" TEXT,
    "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
    "totalTestCases" INTEGER NOT NULL DEFAULT 0,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContestInfringement_contestId_studentId_idx" ON "ContestInfringement"("contestId", "studentId");

-- CreateIndex
CREATE INDEX "Problem_contestId_orderIndex_idx" ON "Problem"("contestId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_contestId_code_key" ON "Problem"("contestId", "code");

-- CreateIndex
CREATE INDEX "Submission_contestId_studentId_idx" ON "Submission"("contestId", "studentId");

-- CreateIndex
CREATE INDEX "Submission_contestId_verdict_idx" ON "Submission"("contestId", "verdict");

-- CreateIndex
CREATE INDEX "Submission_problemId_verdict_idx" ON "Submission"("problemId", "verdict");

-- CreateIndex
CREATE INDEX "TestCase_problemId_isSample_idx" ON "TestCase"("problemId", "isSample");

-- CreateIndex
CREATE INDEX "Contest_status_idx" ON "Contest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegistration_participantId_key" ON "ContestRegistration"("participantId");

-- CreateIndex
CREATE INDEX "ContestRegistration_participantId_idx" ON "ContestRegistration"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- CreateIndex
CREATE INDEX "StudentStats_codechefFailCount_idx" ON "StudentStats"("codechefFailCount");

-- CreateIndex
CREATE INDEX "StudentStats_consecutiveFailures_idx" ON "StudentStats"("consecutiveFailures");

-- AddForeignKey
ALTER TABLE "ContestInfringement" ADD CONSTRAINT "ContestInfringement_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
