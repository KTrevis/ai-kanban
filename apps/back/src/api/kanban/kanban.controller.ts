import Elysia from 'elysia';
import { prisma } from '../../lib/prisma';
import {
  getCommittedReviewDiff,
  getUncommittedReviewDiff,
} from '../../git/review-diff';
import { GitRunError, runGit } from '../../git/git-runner';
import { getProjectById } from '../projects/projects.service';
import z from 'zod';
import { patchCard } from './patch-card';
import { UPDATE_KANBAN_CARD_SCHEMA } from './update-card.schema';
import { KANBAN_COLUMNS_SCHEMA } from './kanban-columns.schema';
import {
  getShortBranchName,
  normalizeBranchRef,
} from '../../git/virtual-branch-writer';

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
  .post('card/:cardId/checkout', async ({ params: { cardId }, set }) => {
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
      set.status = 404;
      return { error: 'Kanban card not found' };
    }

    const newBranch = card.newBranch.trim();
    if (!newBranch) {
      set.status = 400;
      return { error: 'Kanban card has no linked branch to checkout' };
    }

    try {
      await runGit(['switch', newBranch], { cwd: card.project.worktree });
    } catch (error) {
      set.status = 400;
      return {
        error:
          error instanceof GitRunError
            ? error.result.stderr.trim() || error.message
            : 'Failed to checkout branch',
      };
    }

    return { branch: newBranch };
  })
  .post('card/:cardId/merge', async ({ params: { cardId }, set }) => {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      select: {
        baseBranch: true,
        newBranch: true,
        project: {
          select: {
            worktree: true,
          },
        },
      },
    });

    if (!card) {
      set.status = 404;
      return { error: 'Kanban card not found' };
    }

    const newBranch = card.newBranch.trim();
    if (!newBranch) {
      set.status = 400;
      return { error: 'Kanban card has no linked branch to merge' };
    }

    try {
      return await mergeBranchIntoBase({
        baseBranch: card.baseBranch,
        branchRef: newBranch,
        repoPath: card.project.worktree,
      });
    } catch (error) {
      set.status = 400;
      return {
        error:
          error instanceof GitRunError
            ? error.result.stderr.trim() || error.message
            : error instanceof Error
              ? error.message
              : 'Failed to merge branch',
      };
    }
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

async function mergeBranchIntoBase({
  baseBranch,
  branchRef,
  repoPath,
}: {
  baseBranch: string;
  branchRef: string;
  repoPath: string;
}) {
  const targetRef = getUpdatableBranchRef(baseBranch);
  const sourceRef = normalizeBranchRef(branchRef);
  const { stdout: baseOidOutput } = await runGit(
    ['rev-parse', '--verify', targetRef],
    { cwd: repoPath },
  );
  const { stdout: branchOidOutput } = await runGit(
    ['rev-parse', '--verify', sourceRef],
    { cwd: repoPath },
  );
  const baseOid = baseOidOutput.trim();
  const branchOid = branchOidOutput.trim();

  try {
    await runGit(['merge-base', '--is-ancestor', baseOid, branchOid], {
      cwd: repoPath,
    });
    await runGit(['update-ref', targetRef, branchOid, baseOid], {
      cwd: repoPath,
    });

    return {
      baseBranch,
      branch: branchRef,
      commitOid: branchOid,
      fastForward: true,
    };
  } catch (error) {
    if (
      !(error instanceof GitRunError) ||
      error.result.args[0] !== 'merge-base'
    ) {
      throw error;
    }
  }

  const { stdout: treeOidOutput } = await runGit(
    ['merge-tree', '--write-tree', baseOid, branchOid],
    { cwd: repoPath },
  );
  const mergeMessage = `Merge branch '${getShortBranchName(
    branchRef,
  )}' into ${getShortBranchName(baseBranch)}`;
  const mergeIdentity = {
    GIT_AUTHOR_EMAIL: 'agent@travaille.local',
    GIT_AUTHOR_NAME: 'Travaille Agent',
    GIT_COMMITTER_EMAIL: 'agent@travaille.local',
    GIT_COMMITTER_NAME: 'Travaille Agent',
  };
  const { stdout: commitOidOutput } = await runGit(
    [
      'commit-tree',
      treeOidOutput.trim(),
      '-p',
      baseOid,
      '-p',
      branchOid,
      '-m',
      mergeMessage,
    ],
    { cwd: repoPath, env: mergeIdentity },
  );
  const commitOid = commitOidOutput.trim();
  await runGit(['update-ref', targetRef, commitOid, baseOid], {
    cwd: repoPath,
  });

  return {
    baseBranch,
    branch: branchRef,
    commitOid,
    fastForward: false,
  };
}

function getUpdatableBranchRef(ref: string) {
  if (ref.startsWith('refs/heads/')) {
    return ref;
  }

  if (ref === 'HEAD' || ref.startsWith('refs/')) {
    throw new Error('Base branch must be a local branch to merge into');
  }

  return normalizeBranchRef(ref);
}
