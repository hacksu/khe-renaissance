-- DropForeignKey (guarded — tables may not exist on fresh deployments)
ALTER TABLE IF EXISTS "judge_assignment" DROP CONSTRAINT IF EXISTS "judge_assignment_projectId_fkey";
ALTER TABLE IF EXISTS "judge_assignment" DROP CONSTRAINT IF EXISTS "judge_assignment_userId_fkey";
ALTER TABLE IF EXISTS "judgement" DROP CONSTRAINT IF EXISTS "judgement_projectId_fkey";
ALTER TABLE IF EXISTS "judgement" DROP CONSTRAINT IF EXISTS "judgement_userId_fkey";
ALTER TABLE IF EXISTS "judgement_score" DROP CONSTRAINT IF EXISTS "judgement_score_criterionId_fkey";
ALTER TABLE IF EXISTS "judgement_score" DROP CONSTRAINT IF EXISTS "judgement_score_judgementId_fkey";

-- AlterTable (guarded — columns may already exist)
ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "checkedIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "judging_criterion" ADD COLUMN IF NOT EXISTS "allowOptOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "judgeTrack" TEXT;

-- DropTable (guarded — tables may not exist on fresh deployments)
DROP TABLE IF EXISTS "judge_assignment";
DROP TABLE IF EXISTS "judgement";
DROP TABLE IF EXISTS "judgement_score";

-- CreateTable (guarded)
CREATE TABLE IF NOT EXISTS "table_visit" (
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

CREATE TABLE IF NOT EXISTS "visit_opt_out" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,

    CONSTRAINT "visit_opt_out_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pair_comparison" (
    "id" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "projectAId" TEXT NOT NULL,
    "projectBId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pair_comparison_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pair_criterion_result" (
    "id" TEXT NOT NULL,
    "pairComparisonId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "winner" TEXT NOT NULL,

    CONSTRAINT "pair_criterion_result_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crowd_bt_state" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "alpha" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "beta" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "comparisonCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "crowd_bt_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (guarded)
CREATE INDEX IF NOT EXISTS "table_visit_judgeId_idx" ON "table_visit"("judgeId");
CREATE INDEX IF NOT EXISTS "table_visit_projectId_idx" ON "table_visit"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "table_visit_judgeId_projectId_key" ON "table_visit"("judgeId", "projectId");
CREATE INDEX IF NOT EXISTS "visit_opt_out_visitId_idx" ON "visit_opt_out"("visitId");
CREATE UNIQUE INDEX IF NOT EXISTS "visit_opt_out_visitId_criterionId_key" ON "visit_opt_out"("visitId", "criterionId");
CREATE INDEX IF NOT EXISTS "pair_comparison_judgeId_idx" ON "pair_comparison"("judgeId");
CREATE INDEX IF NOT EXISTS "pair_comparison_projectAId_idx" ON "pair_comparison"("projectAId");
CREATE INDEX IF NOT EXISTS "pair_comparison_projectBId_idx" ON "pair_comparison"("projectBId");
CREATE INDEX IF NOT EXISTS "pair_criterion_result_pairComparisonId_idx" ON "pair_criterion_result"("pairComparisonId");
CREATE INDEX IF NOT EXISTS "pair_criterion_result_criterionId_idx" ON "pair_criterion_result"("criterionId");
CREATE UNIQUE INDEX IF NOT EXISTS "pair_criterion_result_pairComparisonId_criterionId_key" ON "pair_criterion_result"("pairComparisonId", "criterionId");
CREATE INDEX IF NOT EXISTS "crowd_bt_state_projectId_idx" ON "crowd_bt_state"("projectId");
CREATE INDEX IF NOT EXISTS "crowd_bt_state_criterionId_idx" ON "crowd_bt_state"("criterionId");
CREATE UNIQUE INDEX IF NOT EXISTS "crowd_bt_state_projectId_criterionId_key" ON "crowd_bt_state"("projectId", "criterionId");

-- AddForeignKey (guarded via drop-then-add)
ALTER TABLE "table_visit" DROP CONSTRAINT IF EXISTS "table_visit_judgeId_fkey";
ALTER TABLE "table_visit" ADD CONSTRAINT "table_visit_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "table_visit" DROP CONSTRAINT IF EXISTS "table_visit_projectId_fkey";
ALTER TABLE "table_visit" ADD CONSTRAINT "table_visit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "visit_opt_out" DROP CONSTRAINT IF EXISTS "visit_opt_out_visitId_fkey";
ALTER TABLE "visit_opt_out" ADD CONSTRAINT "visit_opt_out_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "table_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "visit_opt_out" DROP CONSTRAINT IF EXISTS "visit_opt_out_criterionId_fkey";
ALTER TABLE "visit_opt_out" ADD CONSTRAINT "visit_opt_out_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pair_comparison" DROP CONSTRAINT IF EXISTS "pair_comparison_judgeId_fkey";
ALTER TABLE "pair_comparison" ADD CONSTRAINT "pair_comparison_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pair_comparison" DROP CONSTRAINT IF EXISTS "pair_comparison_projectAId_fkey";
ALTER TABLE "pair_comparison" ADD CONSTRAINT "pair_comparison_projectAId_fkey" FOREIGN KEY ("projectAId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pair_comparison" DROP CONSTRAINT IF EXISTS "pair_comparison_projectBId_fkey";
ALTER TABLE "pair_comparison" ADD CONSTRAINT "pair_comparison_projectBId_fkey" FOREIGN KEY ("projectBId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pair_criterion_result" DROP CONSTRAINT IF EXISTS "pair_criterion_result_pairComparisonId_fkey";
ALTER TABLE "pair_criterion_result" ADD CONSTRAINT "pair_criterion_result_pairComparisonId_fkey" FOREIGN KEY ("pairComparisonId") REFERENCES "pair_comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pair_criterion_result" DROP CONSTRAINT IF EXISTS "pair_criterion_result_criterionId_fkey";
ALTER TABLE "pair_criterion_result" ADD CONSTRAINT "pair_criterion_result_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crowd_bt_state" DROP CONSTRAINT IF EXISTS "crowd_bt_state_projectId_fkey";
ALTER TABLE "crowd_bt_state" ADD CONSTRAINT "crowd_bt_state_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crowd_bt_state" DROP CONSTRAINT IF EXISTS "crowd_bt_state_criterionId_fkey";
ALTER TABLE "crowd_bt_state" ADD CONSTRAINT "crowd_bt_state_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
