-- AlterTable
ALTER TABLE "StudentStats" ADD COLUMN     "departmentRanking" INTEGER,
ADD COLUMN     "ranking" INTEGER;

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
