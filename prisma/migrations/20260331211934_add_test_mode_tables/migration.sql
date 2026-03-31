-- CreateTable
CREATE TABLE "TestClient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TestServiceSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "TestServiceSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "TestClient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestFormula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "developer" TEXT,
    "ratio" TEXT,
    "processingMin" INTEGER,
    "notes" TEXT,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "TestFormula_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestServiceSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TestServiceSession_clientId_idx" ON "TestServiceSession"("clientId");

-- CreateIndex
CREATE INDEX "TestFormula_sessionId_idx" ON "TestFormula"("sessionId");
