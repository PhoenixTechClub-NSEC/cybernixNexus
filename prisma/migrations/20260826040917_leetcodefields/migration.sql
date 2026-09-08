-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "github" TEXT,
ADD COLUMN     "linkedin" TEXT;

-- AlterTable
ALTER TABLE "StudentStats" ADD COLUMN     "leetcodeEasySolved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "leetcodeHardSolved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "leetcodeMediumSolved" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Editorial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemUrl" TEXT,
    "platform" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT[],
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "codeSnippet" TEXT NOT NULL,
    "codeLanguage" TEXT NOT NULL DEFAULT 'cpp',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Editorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "editorialId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditorialComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialLike" (
    "id" TEXT NOT NULL,
    "editorialId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditorialLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "duration" TEXT NOT NULL,
    "registeredCount" INTEGER NOT NULL DEFAULT 0,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "description" TEXT,
    "badge" TEXT,
    "ratedFor" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestRegistration" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Editorial_platform_idx" ON "Editorial"("platform");

-- CreateIndex
CREATE INDEX "Editorial_difficulty_idx" ON "Editorial"("difficulty");

-- CreateIndex
CREATE INDEX "Editorial_authorId_idx" ON "Editorial"("authorId");

-- CreateIndex
CREATE INDEX "Editorial_createdAt_idx" ON "Editorial"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "EditorialComment_editorialId_idx" ON "EditorialComment"("editorialId");

-- CreateIndex
CREATE INDEX "EditorialComment_authorId_idx" ON "EditorialComment"("authorId");

-- CreateIndex
CREATE INDEX "EditorialLike_editorialId_idx" ON "EditorialLike"("editorialId");

-- CreateIndex
CREATE UNIQUE INDEX "EditorialLike_editorialId_studentId_key" ON "EditorialLike"("editorialId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_externalId_key" ON "Contest"("externalId");

-- CreateIndex
CREATE INDEX "Contest_startTime_idx" ON "Contest"("startTime");

-- CreateIndex
CREATE INDEX "Contest_platform_idx" ON "Contest"("platform");

-- CreateIndex
CREATE INDEX "Contest_isInternal_idx" ON "Contest"("isInternal");

-- CreateIndex
CREATE INDEX "ContestRegistration_contestId_idx" ON "ContestRegistration"("contestId");

-- CreateIndex
CREATE INDEX "ContestRegistration_studentId_idx" ON "ContestRegistration"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegistration_contestId_studentId_key" ON "ContestRegistration"("contestId", "studentId");

-- AddForeignKey
ALTER TABLE "Editorial" ADD CONSTRAINT "Editorial_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialComment" ADD CONSTRAINT "EditorialComment_editorialId_fkey" FOREIGN KEY ("editorialId") REFERENCES "Editorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialComment" ADD CONSTRAINT "EditorialComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialLike" ADD CONSTRAINT "EditorialLike_editorialId_fkey" FOREIGN KEY ("editorialId") REFERENCES "Editorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialLike" ADD CONSTRAINT "EditorialLike_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestRegistration" ADD CONSTRAINT "ContestRegistration_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestRegistration" ADD CONSTRAINT "ContestRegistration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
