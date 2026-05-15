import Elysia from 'elysia';
import { prisma } from '../../lib/prisma';
import z from 'zod/v3';
import { KanbanColumn } from '../../generated/prisma/enums';
import { notifyAgentTaskFinished } from '../../lib/notifications';
import { getDiff } from '../../git/virtual-branch-writer';
import { opencodeClient } from '../opencode/opencode.controller';
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
  .get('card/:cardId/review', async ({ params: { cardId }, set }) => {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      set.status = 404;
      return { error: 'Kanban card not found' };
    }

    const newBranch = card.newBranch.trim();
    if (!newBranch) {
      set.status = 400;
      return { error: 'Kanban card has no linked branch to review' };
    }

    const { data: projects = [] } = await opencodeClient.project.list();
    const project = projects.find((project) => project.id === card.projectId);

    if (!project) {
      set.status = 404;
      return { error: 'OpenCode project not found' };
    }

    const diff = await getDiff({
      baseRef: card.baseBranch,
      branchRef: newBranch,
      repoPath: project.worktree,
    });

    return {
      baseBranch: card.baseBranch,
      cardId: card.id,
      diff,
      isEmpty: diff.trim().length === 0,
      newBranch,
      projectId: card.projectId,
    };
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
          newBranch: '',
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
