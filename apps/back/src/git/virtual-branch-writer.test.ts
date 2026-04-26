import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { runGit } from './git-runner';
import {
  commitVirtualChanges,
  getDiff,
  readFileFromRef,
} from './virtual-branch-writer';

describe('virtual branch writer', () => {
  test('commits changes to a branch without checking it out or touching the worktree', async () => {
    const repoPath = await mkdtemp(join(tmpdir(), 'travaille-git-repo-'));

    try {
      await initTestRepo(repoPath);

      const originalBranch = await currentBranch(repoPath);
      const originalWorktreeContent = await readFile(
        join(repoPath, 'README.md'),
        'utf8',
      );

      const result = await commitVirtualChanges({
        branchRef: 'refs/heads/ai/test-card',
        changes: [
          {
            content: 'updated from virtual branch\n',
            path: 'README.md',
            type: 'write',
          },
          {
            content: 'export const value = 1;\n',
            path: 'src/generated.ts',
            type: 'write',
          },
        ],
        message: 'AI test change',
        repoPath,
      });

      await expect(currentBranch(repoPath)).resolves.toBe(originalBranch);
      await expect(
        readFile(join(repoPath, 'README.md'), 'utf8'),
      ).resolves.toBe(originalWorktreeContent);
      await expect(
        readFileFromRef({
          filePath: 'README.md',
          ref: 'refs/heads/ai/test-card',
          repoPath,
        }),
      ).resolves.toBe('updated from virtual branch\n');
      await expect(
        readFileFromRef({
          filePath: 'src/generated.ts',
          ref: 'refs/heads/ai/test-card',
          repoPath,
        }),
      ).resolves.toBe('export const value = 1;\n');

      const diff = await getDiff({
        baseRef: 'main',
        branchRef: 'refs/heads/ai/test-card',
        repoPath,
      });
      const status = await runGit(['status', '--short'], { cwd: repoPath });

      expect(result.parentOid).not.toBe(result.commitOid);
      expect(diff).toContain('+updated from virtual branch');
      expect(diff).toContain('+export const value = 1;');
      expect(status.stdout).toBe('');
    } finally {
      await rm(repoPath, { force: true, recursive: true });
    }
  });
});

async function initTestRepo(repoPath: string) {
  await runGit(['init', '-b', 'main'], { cwd: repoPath });
  await mkdir(join(repoPath, 'src'));
  await writeFile(join(repoPath, 'README.md'), 'initial\n');
  await runGit(['add', 'README.md'], { cwd: repoPath });
  await runGit(['commit', '-m', 'Initial commit'], {
    cwd: repoPath,
    env: gitIdentityEnv(),
  });
}

async function currentBranch(repoPath: string) {
  const { stdout } = await runGit(['branch', '--show-current'], {
    cwd: repoPath,
  });

  return stdout.trim();
}

function gitIdentityEnv() {
  return {
    GIT_AUTHOR_EMAIL: 'test@travaille.local',
    GIT_AUTHOR_NAME: 'Travaille Test',
    GIT_COMMITTER_EMAIL: 'test@travaille.local',
    GIT_COMMITTER_NAME: 'Travaille Test',
  };
}
