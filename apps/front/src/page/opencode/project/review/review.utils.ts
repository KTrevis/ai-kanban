import type { SplitSide } from '@git-diff-view/react';

export type DiffFilePatch = {
  filename: string;
  patch: string;
};

export type ReviewComment = {
  line: number;
  comment: string;
  file: string;
  side: SplitSide;
  date: Date;
};

export function splitGitDiff(diff: string): DiffFilePatch[] {
  return diff
    .split(/(?=^diff --git )/m)
    .map((patch) => patch.trimEnd())
    .filter(Boolean)
    .map((patch) => ({
      filename: getDiffFilename(patch),
      patch,
    }));
}

function getDiffFilename(patch: string) {
  const header = patch.match(/^diff --git a\/(.*?) b\/(.*)$/m);
  return header?.[2] ?? 'unknown file';
}
