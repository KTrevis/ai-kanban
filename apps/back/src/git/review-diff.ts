import { runGit } from './git-runner';
import {
  getCheckedOutBranch,
  getShortBranchName,
  normalizeBranchRef,
} from './virtual-branch-writer';

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
  return (await getCheckedOutBranch(repoPath)) === getShortBranchName(branchRef);
}
