import { prisma } from '../../lib/prisma';

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function createProject({
  id,
  name,
  worktree,
}: {
  id?: string;
  name: string;
  worktree: string;
}) {
  return prisma.project.create({
    data: {
      id: id ?? crypto.randomUUID(),
      name,
      worktree,
    },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
  });
}

export async function deleteProject(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.kanbanCard.deleteMany({
      where: { projectId: id },
    });

    return tx.project.delete({
      where: { id },
    });
  });
}
