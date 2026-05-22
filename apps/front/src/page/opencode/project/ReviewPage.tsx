import {
  useCheckoutKanbanCardBranch,
  useGetKanbanCardReview,
} from '#/hooks/queries/kanban/kanban.queries';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import { DiffModeEnum, SplitSide } from '@git-diff-view/react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ReviewContent } from './review/ReviewContent';
import { ReviewHeader } from './review/ReviewHeader';
import { splitGitDiff, type ReviewComment } from './review/review.utils';

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
  const { data: projects = [] } = useGetProjects();
  const projectId = data?.projectId;
  const sessionId = data?.sessionId;
  const project = projects.find((project) => project.id === projectId);
  const projectFirstChar = Array.from(project?.name ?? '')[0];
  const [mode, setMode] = useState<DiffModeEnum>(DiffModeEnum.Unified);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const { mutate: checkoutBranch, isPending: isCheckingOutBranch } =
    useCheckoutKanbanCardBranch(cardId);
  const { mutate: sendMessage } = useSendSessionMessage();
  const navigate = useNavigate();
  const files = useMemo(
    () => splitGitDiff(data?.uncommittedDiff ?? ''),
    [data?.uncommittedDiff],
  );

  useEffect(() => {
    document.title = projectFirstChar
      ? `${projectFirstChar} - Review`
      : 'Travaille - Review';
  }, [projectFirstChar]);

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    if (projectId) {
      navigate({
        to: '/project/$id',
        params: { id: projectId },
      });
    }
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col text-gray-100">
      <ReviewHeader
        isCheckingOutBranch={isCheckingOutBranch}
        mode={mode}
        newBranch={data?.newBranch}
        onBack={goBack}
        onCheckoutBranch={() => {
          if (!data?.newBranch) {
            toast.error('No branch linked to the card');
            return;
          }

          checkoutBranch(undefined, {
            onError(error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to checkout branch',
              );
            },
            onSuccess() {
              toast.success(`Checked out ${data.newBranch}`);
            },
          });
        }}
        onModeChange={setMode}
        onSendReview={() => {
          if (!projectId) {
            toast.error('No project id linked to the card');
            return;
          }

          if (!sessionId) {
            toast.error('No session id linked to the card');
            return;
          }

          sendMessage(
            {
              type: 'send-message-to-session',
              message: formatComments(comments),
              projectId,
              sessionId,
            },
            {
              onSuccess() {
                toast.success('Review comments sent');
                navigate({
                  to: '/project/$id',
                  params: { id: projectId },
                  search: {
                    sessionId,
                  },
                });
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
