import { runGit } from './git-runner';

export function normalizeBranchRef(ref: string) {
  return ref.startsWith('refs/') ? ref : `refs/heads/${ref}`;
}

export function getShortBranchName(ref: string) {
  return ref.startsWith('refs/heads/') ? ref.slice('refs/heads/'.length) : ref;
}

export async function getCheckedOutBranch(repoPath: string) {
  const { stdout } = await runGit(['branch', '--show-current'], {
    cwd: repoPath,
  });
  const branch = stdout.trim();

  return branch || null;
}
