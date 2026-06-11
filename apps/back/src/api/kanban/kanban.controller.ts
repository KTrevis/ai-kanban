import Elysia from 'elysia';
import { prisma } from '../../lib/prisma';
import {
  getCommittedReviewDiff,
  getUncommittedReviewDiff,
} from '../../git/review-diff';
import { getShortBranchName, normalizeBranchRef } from '../../git/git-refs';
import { GitRunError, runGit } from '../../git/git-runner';
import { HttpError } from '../../lib/http-error';
import { getProjectById } from '../projects/projects.service';
import z from 'zod';
import { patchCard } from './patch-card';
import { UPDATE_KANBAN_CARD_SCHEMA } from './update-card.schema';
import { KANBAN_COLUMNS_SCHEMA } from './kanban-columns.schema';
import {
  getMergeBranchStatus,
  mergeKanbanCardBranch,
} from './merge-card-branch';
import { websockets } from '../ws/ws.controller';

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

export const KANBAN_CONTROLLER = new Elysia({ prefix: 'kanban' })
  .get('cards/:projectId', ({ params: { projectId } }) => {
    return getProjectCards(projectId);
  })
  .get('card/:cardId', async ({ params: { cardId } }) => {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new HttpError(404, 'Kanban card not found');
    }

    return card;
  })
  .get('card/:cardId/review', async ({ params: { cardId } }) => {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new HttpError(404, 'Kanban card not found');
    }

    const newBranch = card.newBranch.trim();
    if (!newBranch) {
      throw new HttpError(400, 'Kanban card has no linked branch to review');
    }

    const project = await getProjectById(card.projectId);

    if (!project) {
      throw new HttpError(404, 'Project not found');
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
    const mergeStatus = await getMergeBranchStatus({
      baseBranch: card.baseBranch,
      branchRef: newBranch,
      repoPath: project.worktree,
    });

    return {
      baseBranch: card.baseBranch,
      canMerge: mergeStatus.canMerge,
      cannotMergeReason: mergeStatus.cannotMergeReason,
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
  .post('card/:cardId/checkout', async ({ params: { cardId } }) => {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      select: {
        newBranch: true,
        project: {
          select: {
            worktree: true,
          },
        },
      },
    });

    if (!card) {
      throw new HttpError(404, 'Kanban card not found');
    }

    const newBranch = card.newBranch.trim();
    if (!newBranch) {
      throw new HttpError(400, 'Kanban card has no linked branch to checkout');
    }

    try {
      await runGit(['switch', newBranch], { cwd: card.project.worktree });
    } catch (error) {
      throw new HttpError(
        400,
        error instanceof GitRunError
          ? error.result.stderr.trim() || error.message
          : 'Failed to checkout branch',
      );
    }

    return { branch: newBranch };
  })
  .post('card/:cardId/merge', mergeKanbanCardBranch)
  .patch(
    'cards',
    async ({ body }) => {
      for (const card of body) {
        const { projectId } = await prisma.kanbanCard.update({
          where: { id: card.id },
          data: {
            column: card.column,
            position: card.position,
          },
          select: {
            projectId: true,
          },
        });
        websockets.sendMessage({
          projectId,
          type: 'cards.updated',
        });
      }
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
    ({ body, params: { cardId } }) => patchCard(cardId, body),
    {
      body: UPDATE_KANBAN_CARD_SCHEMA,
    },
  )
  .delete('card/:cardId', async ({ params: { cardId } }) => {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      select: {
        newBranch: true,
        project: {
          select: {
            worktree: true,
          },
        },
      },
    });

    if (!card) {
      throw new HttpError(404, 'Kanban card not found');
    }

    await deleteLinkedLocalBranch({
      branch: card.newBranch,
      repoPath: card.project.worktree,
    });

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

async function deleteLinkedLocalBranch({
  branch,
  repoPath,
}: {
  branch: string;
  repoPath: string;
}) {
  const linkedBranch = branch.trim();
  if (!linkedBranch) {
    return;
  }

  const localBranch = getShortBranchName(linkedBranch);
  const localBranchRef = normalizeBranchRef(localBranch);

  try {
    await runGit(['rev-parse', '--verify', localBranchRef], { cwd: repoPath });
  } catch (error) {
    if (error instanceof GitRunError) {
      return;
    }

    throw error;
  }

  try {
    await runGit(['branch', '-D', localBranch], { cwd: repoPath });
  } catch (error) {
    throw new HttpError(
      400,
      error instanceof GitRunError
        ? error.result.stderr.trim() || error.message
        : 'Failed to delete linked branch',
    );
  }
}
