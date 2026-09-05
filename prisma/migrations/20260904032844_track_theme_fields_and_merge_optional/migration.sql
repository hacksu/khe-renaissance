-- Merge allowOptOut into optional before dropping it, so any criterion
-- marked either way stays excluded from coreScore.
UPDATE "judging_criterion" SET "optional" = "optional" OR "allowOptOut";

-- AlterTable
ALTER TABLE "judging_criterion" DROP COLUMN "allowOptOut";

-- AlterTable
ALTER TABLE "table_visit" ADD COLUMN     "themeAttempted" BOOLEAN,
ADD COLUMN     "themeScore" INTEGER,
ADD COLUMN     "trackFitScore" INTEGER;
