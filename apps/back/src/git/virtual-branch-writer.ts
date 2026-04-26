import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GitRunError, runGit } from './git-runner';

export type VirtualBranchChange =
  | {
      content: string | Uint8Array;
      mode?: '100644' | '100755';
      path: string;
      type: 'write';
    }
  | {
      path: string;
      type: 'delete';
    };

export type CommitVirtualChangesOptions = {
  author?: GitIdentity;
  baseRef?: string;
  branchRef: string;
  changes: VirtualBranchChange[];
  message: string;
  repoPath: string;
};

export type GitIdentity = {
  email: string;
  name: string;
};

export async function ensureBranch({
  baseRef = 'HEAD',
  branchRef,
  repoPath,
}: {
  baseRef?: string;
  branchRef: string;
  repoPath: string;
}) {
  try {
    return await resolveRef({ ref: branchRef, repoPath });
  } catch (error) {
    if (!isGitRefNotFoundError(error)) {
      throw error;
    }
  }

  const baseOid = await resolveRef({ ref: baseRef, repoPath });
  await runGit(['update-ref', branchRef, baseOid], { cwd: repoPath });

  return baseOid;
}

export async function readFileFromRef({
  filePath,
  ref,
  repoPath,
}: {
  filePath: string;
  ref: string;
  repoPath: string;
}) {
  const { stdout } = await runGit(['show', `${ref}:${filePath}`], {
    cwd: repoPath,
  });

  return stdout;
}

export async function getDiff({
  baseRef,
  branchRef,
  repoPath,
}: {
  baseRef: string;
  branchRef: string;
  repoPath: string;
}) {
  const { stdout } = await runGit(['diff', `${baseRef}...${branchRef}`], {
    cwd: repoPath,
  });

  return stdout;
}

export async function commitVirtualChanges({
  author = { email: 'agent@travaille.local', name: 'Travaille Agent' },
  baseRef = 'HEAD',
  branchRef,
  changes,
  message,
  repoPath,
}: CommitVirtualChangesOptions) {
  if (changes.length === 0) {
    throw new Error('Cannot commit without changes');
  }

  const parentOid = await ensureBranch({ baseRef, branchRef, repoPath });
  const tempDir = await mkdtemp(join(tmpdir(), 'travaille-git-index-'));
  const indexPath = join(tempDir, 'index');
  const env = { GIT_INDEX_FILE: indexPath };

  try {
    await runGit(['read-tree', parentOid], { cwd: repoPath, env });

    for (const change of changes) {
      if (change.type === 'delete') {
        await runGit(['update-index', '--force-remove', change.path], {
          cwd: repoPath,
          env,
        });
        continue;
      }

      const { stdout: blobOid } = await runGit(['hash-object', '-w', '--stdin'], {
        cwd: repoPath,
        input: change.content,
      });

      await runGit(
        [
          'update-index',
          '--add',
          '--cacheinfo',
          change.mode ?? '100644',
          blobOid.trim(),
          change.path,
        ],
        { cwd: repoPath, env },
      );
    }

    const { stdout: treeOid } = await runGit(['write-tree'], {
      cwd: repoPath,
      env,
    });
    const { stdout: commitOid } = await runGit(
      ['commit-tree', treeOid.trim(), '-p', parentOid, '-m', message],
      {
        cwd: repoPath,
        env: {
          GIT_AUTHOR_EMAIL: author.email,
          GIT_AUTHOR_NAME: author.name,
          GIT_COMMITTER_EMAIL: author.email,
          GIT_COMMITTER_NAME: author.name,
        },
      },
    );

    const nextOid = commitOid.trim();
    await runGit(['update-ref', branchRef, nextOid, parentOid], {
      cwd: repoPath,
    });

    return {
      branchRef,
      commitOid: nextOid,
      parentOid,
      treeOid: treeOid.trim(),
    };
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

async function resolveRef({ ref, repoPath }: { ref: string; repoPath: string }) {
  const { stdout } = await runGit(['rev-parse', '--verify', ref], {
    cwd: repoPath,
  });

  return stdout.trim();
}

function isGitRefNotFoundError(error: unknown) {
  return error instanceof GitRunError && error.result.code !== 0;
}
