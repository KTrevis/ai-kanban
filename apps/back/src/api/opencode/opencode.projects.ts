import { prisma } from '../../lib/prisma';

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
  });
}
