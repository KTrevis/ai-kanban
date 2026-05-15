import { useGetKanbanCardReview } from '#/hooks/queries/kanban/kanban.queries';
import { DiffModeEnum, SplitSide } from '@git-diff-view/react';
import { useMemo, useState } from 'react';
import { ReviewContent } from './review/ReviewContent';
import { ReviewHeader } from './review/ReviewHeader';
import { splitGitDiff, type ReviewComment } from './review/review.utils';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';

function formatComments(comments: ReviewComment[]) {
  return comments
    .map(
      ({ file, line, side, comment }) =>
        `File : ${file}:${line}
    Side : ${side === SplitSide.new ? 'New' : 'Old'}
    Comment : ${comment}`,
    )
    .join('\n\n');
}

export function ReviewPage({
  cardId,
  projectId,
}: {
  cardId: string;
  projectId: string;
}) {
  const { data, error, isLoading } = useGetKanbanCardReview(cardId);
  const [mode, setMode] = useState<DiffModeEnum>(DiffModeEnum.Unified);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const { mutate: sendMessage } = useSendSessionMessage();
  const files = useMemo(() => splitGitDiff(data?.diff ?? ''), [data?.diff]);

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col text-gray-100">
      <ReviewHeader
        baseBranch={data?.baseBranch}
        mode={mode}
        newBranch={data?.newBranch}
        projectId={projectId}
        onModeChange={setMode}
        onSendReview={() =>
          sendMessage({
            projectId,
            message: formatComments(comments),
            sessionId: data?.sessionId ?? undefined,
          })
        }
      />

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <ReviewContent
          error={error}
          comments={comments}
          files={files}
          isEmpty={data?.isEmpty}
          isLoading={isLoading}
          mode={mode}
          onCommentsChange={setComments}
        />
      </div>
    </section>
  );
}
