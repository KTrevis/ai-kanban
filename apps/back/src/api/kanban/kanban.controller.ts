import Elysia from 'elysia';
import { prisma } from '../../lib/prisma';
import z from 'zod/v3';
import { KanbanColumn } from '../../generated/prisma/enums';
import { notifyAgentTaskFinished } from '../../lib/notifications';
import { websockets } from '../ws/ws.controller';

const KANBAN_COLUMNS_SCHEMA = z.union([
  z.literal(KanbanColumn.AI),
  z.literal(KanbanColumn.DONE),
  z.literal(KanbanColumn.REVIEW),
  z.literal(KanbanColumn.TODO),
]);

const KANBAN_CARD_SCHEMA = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  sessionId: z.string().nullable().optional(),
  title: z.string(),
  description: z.string(),
  column: KANBAN_COLUMNS_SCHEMA,
  position: z.number().int().optional(),
  baseBranch: z.string().optional(),
});

const UPDATE_KANBAN_CARD_SCHEMA = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  column: KANBAN_COLUMNS_SCHEMA.optional(),
  position: z.number().int().optional(),
  sessionId: z.string().nullable().optional(),
  baseBranch: z.string().optional(),
  newBranch: z.string().optional(),
});

export const KANBAN_CONTROLLER = new Elysia({ prefix: 'kanban' })
  .get('cards/:projectId', ({ params: { projectId } }) => {
    return getProjectCards(projectId);
  })
  .get('card/:cardId', async ({ params: { cardId }, set }) => {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      set.status = 404;
      return { error: 'Kanban card not found' };
    }

    return card;
  })
  .patch(
    'cards',
    async ({ body }) => {
      await prisma.$transaction(
        body.map((card) =>
          prisma.kanbanCard.update({
            where: { id: card.id },
            data: {
              column: card.column,
              position: card.position,
            },
          }),
        ),
      );
    },
    {
      body: z
        .object({
          id: z.string(),
          column: KANBAN_COLUMNS_SCHEMA,
          position: z.number().int(),
        })
        .array(),
    },
  )
  .post(
    'card',
    async ({ body }) => {
      const id = body.id ?? crypto.randomUUID();
      const lastCard = await prisma.kanbanCard.findFirst({
        where: {
          column: body.column,
          projectId: body.projectId,
        },
        orderBy: {
          position: 'desc',
        },
      });
      const position = body.position ?? (lastCard?.position ?? -1) + 1;

      return prisma.kanbanCard.create({
        data: {
          id,
          baseBranch: body.baseBranch ?? 'HEAD',
          column: body.column,
          description: body.description,
          newBranch: `refs/heads/ai/card-${id}`,
          position,
          projectId: body.projectId,
          sessionId: body.sessionId,
          title: body.title,
        },
      });
    },
    {
      body: KANBAN_CARD_SCHEMA,
    },
  )
  .patch(
    'card/:cardId',
    async ({ body, params: { cardId } }) => {
      const previousCard = await prisma.kanbanCard.findUnique({
        where: { id: cardId },
      });
      const card = await prisma.kanbanCard.update({
        where: { id: cardId },
        data: body,
      });

      if (
        previousCard?.column !== KanbanColumn.REVIEW &&
        card.column === KanbanColumn.REVIEW
      ) {
        notifyAgentTaskFinished(card.title);
        websockets.sendMessage({
          type: 'cards.updated',
          projectId: card.projectId,
        });
      }

      return card;
    },
    {
      body: UPDATE_KANBAN_CARD_SCHEMA,
    },
  )
  .delete('card/:cardId', ({ params: { cardId } }) => {
    return prisma.kanbanCard.delete({
      where: { id: cardId },
    });
  });

function getProjectCards(projectId: string) {
  return prisma.kanbanCard.findMany({
    where: {
      projectId,
    },
    orderBy: [{ column: 'asc' }, { position: 'asc' }],
  });
}
