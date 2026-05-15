export type DiffFilePatch = {
  filename: string;
  patch: string;
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
