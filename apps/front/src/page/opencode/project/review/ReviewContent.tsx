import { DiffModeEnum } from '@git-diff-view/react';
import { ReviewDiffFile } from './ReviewDiffFile';
import { ReviewStateMessage } from './ReviewStateMessage';
import type { Dispatch, SetStateAction } from 'react';
import type { DiffFilePatch, ReviewComment } from './review.utils';

export function ReviewContent({
  comments,
  error,
  files,
  isEmpty,
  isLoading,
  mode,
  onCommentsChange,
}: {
  comments: ReviewComment[];
  error: unknown;
  files: DiffFilePatch[];
  isEmpty?: boolean;
  isLoading: boolean;
  mode: DiffModeEnum;
  onCommentsChange: Dispatch<SetStateAction<ReviewComment[]>>;
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
        title="No review diff"
        detail="This branch has no committed or tracked uncommitted changes against its base branch."
      />
    );
  }

  return (
    <div className="space-y-6">
      {files.map((file) => (
        <ReviewDiffFile
          comments={comments.filter((comment) => comment.file === file.filename)}
          file={file}
          key={file.filename}
          mode={mode}
          onCommentsChange={onCommentsChange}
        />
      ))}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}
