import { runGit } from './git-runner';

export async function getCommittedReviewDiff({
  baseRef,
  branchRef,
  repoPath,
}: {
  baseRef: string;
  branchRef: string;
  repoPath: string;
}) {
  const { stdout } = await runGit(
    [
      'diff',
      `${baseRef}...${normalizeBranchRef(branchRef)}`,
      '--no-ext-diff',
      '--color=never',
    ],
    { cwd: repoPath },
  );

  return stdout;
}

export async function getUncommittedReviewDiff({
  baseRef,
  branchRef,
  repoPath,
}: {
  baseRef: string;
  branchRef: string;
  repoPath: string;
}) {
  if (!(await isCurrentBranch({ branchRef, repoPath }))) {
    return getCommittedReviewDiff({ baseRef, branchRef, repoPath });
  }

  const { stdout: mergeBase } = await runGit(
    ['merge-base', baseRef, normalizeBranchRef(branchRef)],
    { cwd: repoPath },
  );
  const { stdout } = await runGit(
    ['diff', mergeBase.trim(), '--no-ext-diff', '--color=never'],
    { cwd: repoPath },
  );

  return stdout;
}

async function isCurrentBranch({
  branchRef,
  repoPath,
}: {
  branchRef: string;
  repoPath: string;
}) {
  const { stdout } = await runGit(['branch', '--show-current'], {
    cwd: repoPath,
  });

  return stdout.trim() === getShortBranchName(branchRef);
}

function getShortBranchName(ref: string) {
  return ref.startsWith('refs/heads/') ? ref.slice('refs/heads/'.length) : ref;
}

function normalizeBranchRef(ref: string) {
  return ref.startsWith('refs/') ? ref : `refs/heads/${ref}`;
}
