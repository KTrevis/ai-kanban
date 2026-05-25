import { GitRunError, runGit } from '../../git/git-runner';
import { normalizeBranchRef } from '../../git/git-refs';
import { HttpError } from '../../lib/http-error';
import { prisma } from '../../lib/prisma';

export async function mergeKanbanCardBranch({
  params: { cardId },
}: {
  params: { cardId: string };
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
    throw new HttpError(404, 'Kanban card not found');
  }

  const newBranch = card.newBranch.trim();
  if (!newBranch) {
    throw new HttpError(400, 'Kanban card has no linked branch to merge');
  }

  try {
    return await rebaseBranchIntoBase({
      baseBranch: card.baseBranch,
      branchRef: newBranch,
      repoPath: card.project.worktree,
    });
  } catch (error) {
    let message = 'Failed to rebase branch';
    if (error instanceof GitRunError) {
      message = error.result.stderr.trim() || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    throw new HttpError(400, message);
  }
}

export async function getRebaseBranchStatus({
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
    return { canRebase: true };
  } catch (error) {
    return {
      canRebase: false,
      cannotMergeReason: getRebaseErrorMessage(error),
    };
  }
}

export async function canRebaseBranch(params: {
  baseBranch: string;
  branchRef: string;
  repoPath: string;
}) {
  const status = await getRebaseBranchStatus(params);
  return status.canRebase;
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
  await runGit(['switch', getLocalBranchName(targetRef)], { cwd: repoPath });

  return {
    baseBranch,
    branch: branchRef,
    checkedOutBranch: baseBranch,
    commitOid,
    rebased: true,
  };
}

function getRebaseErrorMessage(error: unknown) {
  if (error instanceof GitRunError) {
    return error.result.stderr.trim() || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Rebase has conflicts';
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

function getLocalBranchName(ref: string) {
  return ref.replace(/^refs\/heads\//, '');
}
