import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import {
  useGetProjectCheckedOutBranch,
  useGetProjects,
} from '#/hooks/queries/opencode/project.queries';
import { DiffModeEnum, SplitSide } from '@git-diff-view/react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ReviewContent } from './ReviewContent';
import { ReviewHeader } from './ReviewHeader';
import { splitGitDiff, type ReviewComment } from './review.utils';
import { ProjectList } from '#/components/opencode/ProjectList';
import { useReviewComments } from './useReviewComments';
import {
  useCheckoutKanbanCardBranch,
  useGetKanbanCardReview,
  useMergeKanbanCardBranch,
} from '#/hooks/mutations/kanban/kanban.mutations';

function formatComments(comments: ReviewComment[]) {
  const PREPROMPT = `Modifie les fichiers dans le workspace courant afin de répondre aux commentaires que t'a fait l'utilisateur.
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
  const checkedOutBranchQuery = useGetProjectCheckedOutBranch(projectId);
  const projectFirstChar = Array.from(project?.name ?? '')[0];
  const [mode, setMode] = useState<DiffModeEnum>(DiffModeEnum.Unified);
  const [comments, setComments, removeComments] = useReviewComments(cardId);
  const { mutate: checkoutBranch, isPending: isCheckingOutBranch } =
    useCheckoutKanbanCardBranch(cardId);
  const { mutate: mergeBranch, isPending: isMergingBranch } =
    useMergeKanbanCardBranch(cardId);
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
    <div className="flex h-screen">
      <ProjectList selectedProject={projectId} />
      <section className="flex h-full min-w-0 flex-1 flex-col text-gray-100">
        <ReviewHeader
          baseBranch={data?.baseBranch}
          canRebase={data?.canRebase}
          cannotMergeReason={data?.cannotMergeReason}
          checkedOutBranch={checkedOutBranchQuery.data?.branch ?? undefined}
          isCheckingOutBranch={isCheckingOutBranch}
          isMergingBranch={isMergingBranch}
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
                checkedOutBranchQuery.refetch();
              },
            });
          }}
          onMergeBranch={() => {
            if (!data?.newBranch) {
              toast.error('No branch linked to the card');
              return;
            }

            if (!data.canRebase) {
              toast.error(data.cannotMergeReason ?? 'Rebase has conflicts');
              return;
            }

            mergeBranch(undefined, {
              onError(error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to rebase branch',
                );
              },
              onSuccess() {
                toast.success('Branch rebased and merged');
                checkedOutBranchQuery.refetch();
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
                message: formatComments(comments),
                projectId,
                sessionId,
              },
              {
                onSuccess() {
                  removeComments();
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
    </div>
  );
}
