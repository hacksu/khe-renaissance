CREATE TABLE IF NOT EXISTS "schedule_event" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'event',
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "schedule_event_pkey" PRIMARY KEY ("id")
);
