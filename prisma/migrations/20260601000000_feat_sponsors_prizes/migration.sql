CREATE TABLE IF NOT EXISTS "sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'ally',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "sponsor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "prize" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "detail" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "place" TEXT,
    "accentColor" TEXT,
    "crown" TEXT,
    "trackName" TEXT,
    "awardName" TEXT,
    CONSTRAINT "prize_pkey" PRIMARY KEY ("id")
);
