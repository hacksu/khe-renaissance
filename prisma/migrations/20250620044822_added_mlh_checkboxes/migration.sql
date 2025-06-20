-- AlterTable
ALTER TABLE "application" ADD COLUMN     "mlhAuthorization" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mlhCodeOfConduct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mlhEmails" BOOLEAN NOT NULL DEFAULT false;
