import { DiffModeEnum, DiffView, SplitSide } from '@git-diff-view/react';
import type { Dispatch, SetStateAction } from 'react';
import type { DiffFilePatch, ReviewComment } from './review.utils';
import { ReviewCommentCreator } from './ReviewCommentCreator';
import { format } from 'date-fns';
import { Button } from '#/components/ui/button';

function buildExtendedData(comments: ReviewComment[], side: SplitSide) {
  return comments.reduce(
    (acc, curr) => {
      if (curr.side !== side) {
        return acc;
      }
      if (!acc[curr.line]) {
        acc[curr.line] = { data: [] };
      }
      acc[curr.line].data.push(curr);
      return acc;
    },
    {} as Record<string, { data: ReviewComment[] }>,
  );
}

function isSameComment(left: ReviewComment, right: ReviewComment) {
  return (
    left.file === right.file &&
    left.line === right.line &&
    left.side === right.side &&
    left.comment === right.comment &&
    left.date.getTime() === right.date.getTime()
  );
}

export function ReviewDiffFile({
  comments,
  file,
  mode,
  onCommentsChange,
}: {
  comments: ReviewComment[];
  file: DiffFilePatch;
  mode: DiffModeEnum;
  onCommentsChange: Dispatch<SetStateAction<ReviewComment[]>>;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-white/10">
      <div className="border-b border-white/10 px-4 py-3 font-mono text-sm">
        {file.filename}
      </div>
      <DiffView
        diffViewAddWidget
        renderWidgetLine={({ onClose, side, lineNumber }) => (
          <ReviewCommentCreator
            onSubmit={(comment) =>
              onCommentsChange((current) => [
                ...current,
                {
                  comment,
                  line: lineNumber,
                  file: file.filename,
                  side,
                  date: new Date(),
                },
              ])
            }
            onClose={onClose}
          />
        )}
        extendData={{
          newFile: buildExtendedData(comments, SplitSide.new),
          oldFile: buildExtendedData(comments, SplitSide.old),
        }}
        renderExtendLine={({ data }) => (
          <div className="flex border-y border-gray-700 py-2">
            <div className="w-[1%] min-w-25" />
            <div className="flex-1 space-y-3 pr-4">
              {data.map((curr) => (
                <div
                  key={`${curr.file}:${curr.side}:${curr.line}:${curr.date.getTime()}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-white!">
                      {format(curr.date, 'dd-MM-yyyy HH:mm:ss')}
                    </div>
                    <Button
                      className="px-2 py-1 text-xs"
                      onClick={() =>
                        onCommentsChange((current) =>
                          current.filter(
                            (comment) => !isSameComment(comment, curr),
                          ),
                        )
                      }
                      type="button"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="whitespace-pre-wrap text-xs text-white! wrap-anywhere">
                    {curr.comment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
