import Elysia from 'elysia';
import { prisma } from '../../lib/prisma';
import {
  getCommittedReviewDiff,
  getUncommittedReviewDiff,
} from '../../git/review-diff';
import { getProjectById } from '../projects/projects.service';
import z from 'zod';
import { patchCard } from './patch-card';
import { UPDATE_KANBAN_CARD_SCHEMA } from './update-card.schema';
import { KANBAN_COLUMNS_SCHEMA } from './kanban-columns.schema';

const KANBAN_CARD_SCHEMA = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  sessionId: z.string().nullable().optional(),
  title: z.string(),
  description: z.string(),
  column: KANBAN_COLUMNS_SCHEMA,
  position: z.number().int().optional(),
  baseBranch: z.string().optional(),
  useTravailleMcp: z.boolean().optional(),
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

    const project = await getProjectById(card.projectId);

    if (!project) {
      set.status = 404;
      return { error: 'Project not found' };
    }

    const diff = await getCommittedReviewDiff({
      baseRef: card.baseBranch,
      branchRef: newBranch,
      repoPath: project.worktree,
    });
    const uncommittedDiff = await getUncommittedReviewDiff({
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
      sessionId: card.sessionId,
      uncommittedDiff,
      uncommittedIsEmpty: uncommittedDiff.trim().length === 0,
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
          useTravailleMcp: body.useTravailleMcp ?? true,
        },
      });
    },
    {
      body: KANBAN_CARD_SCHEMA,
    },
  )
  .patch(
    'card/:cardId',
    ({ body, params: { cardId } }) => patchCard(cardId, body),
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
