import { DiffModeEnum, DiffView } from '@git-diff-view/react';
import type { DiffFilePatch } from './review.utils';

export function ReviewDiffFile({
  file,
  mode,
}: {
  file: DiffFilePatch;
  mode: DiffModeEnum;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-white/10">
      <div className="border-b border-white/10 px-4 py-3 font-mono text-sm">
        {file.filename}
      </div>
      <DiffView
        data={{
          newFile: { fileName: file.filename },
          oldFile: { fileName: file.filename },
          hunks: [file.patch],
        }}
        diffViewFontSize={12}
        diffViewHighlight
        diffViewMode={mode}
        diffViewTheme="dark"
        diffViewWrap
      />
    </article>
  );
}
