-- AlterTable: Add lastSyncedAt to Student
ALTER TABLE "Student" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- CreateTable: DailySnapshot
CREATE TABLE "DailySnapshot" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "leetcodeSolved" INTEGER NOT NULL DEFAULT 0,
    "codeforcesSolved" INTEGER NOT NULL DEFAULT 0,
    "gfgScore" INTEGER NOT NULL DEFAULT 0,
    "codechefRating" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MonthlyAchievement
CREATE TABLE "MonthlyAchievement" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "studentId" TEXT,
    "department" TEXT,
    "scoreOrMetric" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on StudentStats.totalScore
CREATE INDEX "StudentStats_totalScore_idx" ON "StudentStats"("totalScore" DESC);

-- CreateUniqueIndex on DailySnapshot(studentId, date)
CREATE UNIQUE INDEX "DailySnapshot_studentId_date_key" ON "DailySnapshot"("studentId", "date");

-- CreateIndex on DailySnapshot(studentId, date)
CREATE INDEX "DailySnapshot_studentId_date_idx" ON "DailySnapshot"("studentId", "date");

-- CreateIndex on DailySnapshot(date)
CREATE INDEX "DailySnapshot_date_idx" ON "DailySnapshot"("date");

-- CreateIndex on MonthlyAchievement(year, month)
CREATE INDEX "MonthlyAchievement_year_month_idx" ON "MonthlyAchievement"("year", "month");

-- CreateIndex on MonthlyAchievement(category)
CREATE INDEX "MonthlyAchievement_category_idx" ON "MonthlyAchievement"("category");

-- AddForeignKey: DailySnapshot -> Student
ALTER TABLE "DailySnapshot" ADD CONSTRAINT "DailySnapshot_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: MonthlyAchievement -> Student
ALTER TABLE "MonthlyAchievement" ADD CONSTRAINT "MonthlyAchievement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
