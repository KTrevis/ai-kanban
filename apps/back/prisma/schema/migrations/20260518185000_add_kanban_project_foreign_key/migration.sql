-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KanbanCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "column" TEXT NOT NULL DEFAULT 'TODO',
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "newBranch" TEXT NOT NULL,
    "baseBranch" TEXT NOT NULL,
    "useTravailleMcp" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "KanbanCard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_KanbanCard" ("baseBranch", "column", "createdAt", "description", "id", "newBranch", "position", "projectId", "sessionId", "title", "updatedAt", "useTravailleMcp") SELECT "baseBranch", "column", "createdAt", "description", "id", "newBranch", "position", "projectId", "sessionId", "title", "updatedAt", "useTravailleMcp" FROM "KanbanCard";
DROP TABLE "KanbanCard";
ALTER TABLE "new_KanbanCard" RENAME TO "KanbanCard";
CREATE INDEX "KanbanCard_projectId_column_position_idx" ON "KanbanCard"("projectId", "column", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
