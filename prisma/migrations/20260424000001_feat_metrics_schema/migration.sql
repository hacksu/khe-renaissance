-- DropForeignKey
ALTER TABLE "judge_assignment" DROP CONSTRAINT "judge_assignment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "judge_assignment" DROP CONSTRAINT "judge_assignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "judgement" DROP CONSTRAINT "judgement_projectId_fkey";

-- DropForeignKey
ALTER TABLE "judgement" DROP CONSTRAINT "judgement_userId_fkey";

-- DropForeignKey
ALTER TABLE "judgement_score" DROP CONSTRAINT "judgement_score_criterionId_fkey";

-- DropForeignKey
ALTER TABLE "judgement_score" DROP CONSTRAINT "judgement_score_judgementId_fkey";

-- AlterTable
ALTER TABLE "application" ADD COLUMN "checkedIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "judging_criterion" ADD COLUMN "allowOptOut" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN "judgeTrack" TEXT;

-- DropTable
DROP TABLE "judge_assignment";

-- DropTable
DROP TABLE "judgement";

-- DropTable
DROP TABLE "judgement_score";

-- CreateTable
CREATE TABLE "table_visit" (
    "id" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "table_visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_opt_out" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,

    CONSTRAINT "visit_opt_out_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pair_comparison" (
    "id" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "projectAId" TEXT NOT NULL,
    "projectBId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pair_comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pair_criterion_result" (
    "id" TEXT NOT NULL,
    "pairComparisonId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "winner" TEXT NOT NULL,

    CONSTRAINT "pair_criterion_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowd_bt_state" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "alpha" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "beta" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "comparisonCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "crowd_bt_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "table_visit_judgeId_idx" ON "table_visit"("judgeId");

-- CreateIndex
CREATE INDEX "table_visit_projectId_idx" ON "table_visit"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "table_visit_judgeId_projectId_key" ON "table_visit"("judgeId", "projectId");

-- CreateIndex
CREATE INDEX "visit_opt_out_visitId_idx" ON "visit_opt_out"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "visit_opt_out_visitId_criterionId_key" ON "visit_opt_out"("visitId", "criterionId");

-- CreateIndex
CREATE INDEX "pair_comparison_judgeId_idx" ON "pair_comparison"("judgeId");

-- CreateIndex
CREATE INDEX "pair_comparison_projectAId_idx" ON "pair_comparison"("projectAId");

-- CreateIndex
CREATE INDEX "pair_comparison_projectBId_idx" ON "pair_comparison"("projectBId");

-- CreateIndex
CREATE INDEX "pair_criterion_result_pairComparisonId_idx" ON "pair_criterion_result"("pairComparisonId");

-- CreateIndex
CREATE INDEX "pair_criterion_result_criterionId_idx" ON "pair_criterion_result"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "pair_criterion_result_pairComparisonId_criterionId_key" ON "pair_criterion_result"("pairComparisonId", "criterionId");

-- CreateIndex
CREATE INDEX "crowd_bt_state_projectId_idx" ON "crowd_bt_state"("projectId");

-- CreateIndex
CREATE INDEX "crowd_bt_state_criterionId_idx" ON "crowd_bt_state"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "crowd_bt_state_projectId_criterionId_key" ON "crowd_bt_state"("projectId", "criterionId");

-- AddForeignKey
ALTER TABLE "table_visit" ADD CONSTRAINT "table_visit_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_visit" ADD CONSTRAINT "table_visit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_opt_out" ADD CONSTRAINT "visit_opt_out_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "table_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_opt_out" ADD CONSTRAINT "visit_opt_out_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pair_comparison" ADD CONSTRAINT "pair_comparison_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pair_comparison" ADD CONSTRAINT "pair_comparison_projectAId_fkey" FOREIGN KEY ("projectAId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pair_comparison" ADD CONSTRAINT "pair_comparison_projectBId_fkey" FOREIGN KEY ("projectBId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pair_criterion_result" ADD CONSTRAINT "pair_criterion_result_pairComparisonId_fkey" FOREIGN KEY ("pairComparisonId") REFERENCES "pair_comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pair_criterion_result" ADD CONSTRAINT "pair_criterion_result_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crowd_bt_state" ADD CONSTRAINT "crowd_bt_state_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crowd_bt_state" ADD CONSTRAINT "crowd_bt_state_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
