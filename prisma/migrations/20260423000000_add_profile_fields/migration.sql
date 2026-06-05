-- AlterTable
ALTER TABLE "application"
    ADD COLUMN "raceEthnicity"        TEXT NOT NULL DEFAULT '',
    ADD COLUMN "sexuality"             TEXT NOT NULL DEFAULT '',
    ADD COLUMN "firstGenStudent"       TEXT NOT NULL DEFAULT '',
    ADD COLUMN "hackatonsAttended"     TEXT NOT NULL DEFAULT '',
    ADD COLUMN "experienceLevel"       TEXT NOT NULL DEFAULT '',
    ADD COLUMN "areasOfInterest"       TEXT NOT NULL DEFAULT '',
    ADD COLUMN "heardAboutUs"          TEXT NOT NULL DEFAULT '',
    ADD COLUMN "linkedinUrl"           TEXT NOT NULL DEFAULT '',
    ADD COLUMN "interestedInSponsors"  TEXT NOT NULL DEFAULT '',
    ADD COLUMN "teamPreference"        TEXT NOT NULL DEFAULT '',
    ADD COLUMN "tshirtSize"            TEXT NOT NULL DEFAULT '';
