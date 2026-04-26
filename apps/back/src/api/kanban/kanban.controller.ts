import Elysia from 'elysia';
import { KanbanColumn } from '../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import z from 'zod';

const KANBAN_COLUMN_SCHEMA = z.union([
  z.literal(KanbanColumn.TODO),
  z.literal(KanbanColumn.AI),
  z.literal(KanbanColumn.REVIEW),
  z.literal(KanbanColumn.DONE),
]);

export const KANBAN_CONTROLLER = new Elysia({ prefix: 'kanban' })
  .get(
    'project/:projectId/cards',
    async ({ params: { projectId } }) => {
      return prisma.kanbanCard.findMany({
        orderBy: [{ column: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
        where: { projectId },
      });
    },
    {
      params: z.object({
        projectId: z.string(),
      }),
    },
  )
  .post(
    'project/:projectId/cards',
    async ({ body, params: { projectId } }) => {
      const column = body.column ?? KanbanColumn.TODO;
      const lastCard = await prisma.kanbanCard.findFirst({
        orderBy: { position: 'desc' },
        select: { position: true },
        where: { column, projectId },
      });

      return prisma.kanbanCard.create({
        data: {
          baseBranch: body.baseBranch,
          newBranch: body.newBranch,
          column,
          description: body.description,
          position: (lastCard?.position ?? -1) + 1,
          projectId,
          title: body.title,
        },
      });
    },
    {
      body: z.object({
        baseBranch: z.string(),
        column: z.optional(KANBAN_COLUMN_SCHEMA),
        description: z.string(),
        newBranch: z.string(),
        title: z.string(),
      }),
      params: z.object({
        projectId: z.string(),
      }),
    },
  );
