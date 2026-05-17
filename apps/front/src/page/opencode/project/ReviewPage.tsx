import { useGetKanbanCardReview } from '#/hooks/queries/kanban/kanban.queries';
import { DiffModeEnum, SplitSide } from '@git-diff-view/react';
import { useMemo, useState } from 'react';
import { ReviewContent } from './review/ReviewContent';
import { ReviewHeader } from './review/ReviewHeader';
import { splitGitDiff, type ReviewComment } from './review/review.utils';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

function formatComments(comments: ReviewComment[]) {
  const PREPROMPT = `Utilise le MCP travaille pour modifier les fichier afin de répondre aux commentaires que t'a fait l'utilisateur.
    S'il s'agit d'une question, réponds directement dans le tchat.\n\n`;

  return (
    PREPROMPT +
    comments
      .map(({ file, line, side, comment }) =>
        [
          `File : ${file}:${line}`,
          `Side : ${side === SplitSide.new ? 'New' : 'Old'}`,
          `Comment : ${comment}`,
        ].join('\n\n'),
      )
      .join('\n\n')
  );
}

export function ReviewPage({ cardId }: { cardId: string }) {
  const { data, error, isLoading } = useGetKanbanCardReview(cardId);
  const projectId = data?.projectId;
  const [mode, setMode] = useState<DiffModeEnum>(DiffModeEnum.Unified);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const { mutate: sendMessage } = useSendSessionMessage();
  const navigate = useNavigate();
  const files = useMemo(
    () => splitGitDiff(data?.uncommittedDiff ?? ''),
    [data?.uncommittedDiff],
  );

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col text-gray-100">
      <ReviewHeader
        mode={mode}
        newBranch={data?.newBranch}
        projectId={projectId}
        onModeChange={setMode}
        onSendReview={() => {
          if (!projectId) {
            return;
          }

          sendMessage(
            {
              projectId,
              message: formatComments(comments),
              sessionId: data?.sessionId ?? undefined,
            },
            {
              onSuccess() {
                toast.success('Review comments sent');
                const sessionId = data.sessionId;
                if (sessionId) {
                  navigate({
                    to: '/project/$id',
                    params: { id: projectId },
                    search: {
                      sessionId,
                    },
                  });
                }
              },
            },
          );
        }}
      />

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <ReviewContent
          error={error}
          comments={comments}
          files={files}
          isEmpty={data?.uncommittedIsEmpty}
          isLoading={isLoading}
          mode={mode}
          onCommentsChange={setComments}
        />
      </div>
    </section>
  );
}
