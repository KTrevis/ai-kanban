-- CreateTable
CREATE TABLE "KanbanCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "column" TEXT NOT NULL DEFAULT 'TODO',
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "newBranch" TEXT NOT NULL,
    "baseBranch" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "KanbanCard_projectId_column_position_idx" ON "KanbanCard"("projectId", "column", "position");
