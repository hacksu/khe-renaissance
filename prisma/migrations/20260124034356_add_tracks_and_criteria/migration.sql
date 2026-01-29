-- AlterTable
ALTER TABLE "application" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tableNumber" TEXT,
    "track" TEXT NOT NULL DEFAULT 'General',
    "trackId" TEXT,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judging_criterion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 5,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "judging_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_assignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judgement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judgement_score" (
    "id" TEXT NOT NULL,
    "judgementId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "judgement_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "track_name_key" ON "track"("name");

-- CreateIndex
CREATE UNIQUE INDEX "judging_criterion_slug_key" ON "judging_criterion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "judge_assignment_userId_projectId_key" ON "judge_assignment"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "judgement_userId_projectId_key" ON "judgement"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "judgement_score_judgementId_criterionId_key" ON "judgement_score"("judgementId", "criterionId");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignment" ADD CONSTRAINT "judge_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignment" ADD CONSTRAINT "judge_assignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgement" ADD CONSTRAINT "judgement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgement" ADD CONSTRAINT "judgement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgement_score" ADD CONSTRAINT "judgement_score_judgementId_fkey" FOREIGN KEY ("judgementId") REFERENCES "judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgement_score" ADD CONSTRAINT "judgement_score_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
