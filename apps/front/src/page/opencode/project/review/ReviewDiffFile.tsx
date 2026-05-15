import { DiffModeEnum, DiffView, SplitSide } from '@git-diff-view/react';
import type { Dispatch, SetStateAction } from 'react';
import type { DiffFilePatch, ReviewComment } from './review.utils';
import { ReviewCommentCreator } from './ReviewCommentCreator';
import MarkdownPreview from '@uiw/react-markdown-preview';
import './ReviewDiffFile.css';
import { format } from 'date-fns';

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
            <div>
              {data.map((curr) => (
                <div>
                  <div className="text-white!">
                    {format(curr.date, 'dd-MM-yyyy HH:mm:ss')}
                  </div>
                  <MarkdownPreview
                    className="review-comment-markdown"
                    source={curr.comment}
                    style={{
                      background: 'transparent',
                      fontSize: 14,
                      color: 'white',
                    }}
                  />
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
