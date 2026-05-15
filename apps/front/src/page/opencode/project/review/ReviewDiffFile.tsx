import { DiffModeEnum, DiffView, SplitSide } from '@git-diff-view/react';
import type { DiffFilePatch } from './review.utils';
import { useState } from 'react';
import { ReviewCommentCreator } from './ReviewCommentCreator';
import MarkdownPreview from '@uiw/react-markdown-preview';
import './ReviewDiffFile.css';

type Comment = {
  line: number;
  comment: string;
  file: string;
  side: SplitSide;
};

function buildExtendedData(comments: Comment[], side: SplitSide) {
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
    {} as Record<string, { data: Comment[] }>,
  );
}

export function ReviewDiffFile({
  file,
  mode,
}: {
  file: DiffFilePatch;
  mode: DiffModeEnum;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  console.log(comments);

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
              setComments([
                ...comments,
                {
                  comment,
                  line: lineNumber,
                  file: file.filename,
                  side,
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
        renderExtendLine={({ data, lineNumber, diffFile }) => (
          <div className="flex">
            <div className="w-[1%] min-w-25" />
            <MarkdownPreview
              className="review-comment-markdown"
              source={data.map((curr) => curr.comment).join()}
              style={{
                background: 'transparent',
                fontSize: 14,
                color: 'white',
              }}
            />
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
