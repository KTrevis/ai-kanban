import { prisma } from '../../lib/prisma';

export type StoredProject = {
  id: string;
  name: string;
  worktree: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function listProjects() {
  return prisma.$queryRaw<Array<StoredProject>>`
    SELECT id, name, worktree, createdAt, updatedAt
    FROM Project
    WHERE id <> 'global'
    ORDER BY name COLLATE NOCASE ASC
  `;
}

export async function getProjectById(id: string) {
  const projects = await prisma.$queryRaw<Array<StoredProject>>`
    SELECT id, name, worktree, createdAt, updatedAt
    FROM Project
    WHERE id = ${id}
    LIMIT 1
  `;

  return projects[0] ?? null;
}
