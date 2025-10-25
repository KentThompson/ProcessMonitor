-- CreateTable
CREATE TABLE "Classification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "guideline" TEXT NOT NULL,
    "hfInput" JSONB NOT NULL,
    "hfResponse" JSONB,
    "label" TEXT,
    "score" REAL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
