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

function normalizeBranchRef(ref: string) {
  return ref.startsWith('refs/') ? ref : `refs/heads/${ref}`;
}
