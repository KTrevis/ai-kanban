import { DiffModeEnum } from '@git-diff-view/react';
import { ReviewDiffFile } from './ReviewDiffFile';
import { ReviewStateMessage } from './ReviewStateMessage';
import type { DiffFilePatch } from './review.utils';

export function ReviewContent({
  error,
  files,
  isEmpty,
  isLoading,
  mode,
}: {
  error: unknown;
  files: DiffFilePatch[];
  isEmpty?: boolean;
  isLoading: boolean;
  mode: DiffModeEnum;
}) {
  if (isLoading) {
    return <ReviewStateMessage title="Loading diff" />;
  }

  if (error) {
    return (
      <ReviewStateMessage
        title="Unable to load diff"
        detail={getErrorMessage(error)}
      />
    );
  }

  if (isEmpty) {
    return (
      <ReviewStateMessage
        title="No committed diff"
        detail="This branch has no changes against its base branch."
      />
    );
  }

  return (
    <div className="space-y-6">
      {files.map((file) => (
        <ReviewDiffFile file={file} key={file.filename} mode={mode} />
      ))}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}
