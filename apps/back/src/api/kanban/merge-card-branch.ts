import { GitRunError, runGit } from '../../git/git-runner';
import { normalizeBranchRef } from '../../git/virtual-branch-writer';
import { prisma } from '../../lib/prisma';

export async function mergeKanbanCardBranch({
  params: { cardId },
  set,
}: {
  params: { cardId: string };
  set: { status?: number };
}) {
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
    return await rebaseBranchIntoBase({
      baseBranch: card.baseBranch,
      branchRef: newBranch,
      repoPath: card.project.worktree,
    });
  } catch (error) {
    set.status = 400;

    let message = 'Failed to rebase branch';
    if (error instanceof GitRunError) {
      message = error.result.stderr.trim() || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return { error: message };
  }
}

export async function canRebaseBranch({
  baseBranch,
  branchRef,
  repoPath,
}: {
  baseBranch: string;
  branchRef: string;
  repoPath: string;
}) {
  try {
    await runGit(
      [
        'merge-tree',
        '--write-tree',
        getUpdatableBranchRef(baseBranch),
        normalizeBranchRef(branchRef),
      ],
      { cwd: repoPath },
    );
    return true;
  } catch {
    return false;
  }
}

async function rebaseBranchIntoBase({
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

  await runGit(['rebase', targetRef, sourceRef], {
    cwd: repoPath,
    timeoutMs: 120_000,
  });

  const { stdout } = await runGit(['rev-parse', '--verify', sourceRef], {
    cwd: repoPath,
  });
  const commitOid = stdout.trim();
  await runGit(['update-ref', targetRef, commitOid], { cwd: repoPath });

  return {
    baseBranch,
    branch: branchRef,
    commitOid,
    rebased: true,
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
