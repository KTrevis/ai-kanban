import { useGetKanbanCardReview } from '#/hooks/queries/kanban/kanban.queries';
import { DiffModeEnum } from '@git-diff-view/react';
import { useMemo, useState } from 'react';
import { ReviewContent } from './review/ReviewContent';
import { ReviewHeader } from './review/ReviewHeader';
import { splitGitDiff } from './review/review.utils';

export function ReviewPage({
  cardId,
  projectId,
}: {
  cardId: string;
  projectId: string;
}) {
  const { data, error, isLoading } = useGetKanbanCardReview(cardId);
  const [mode, setMode] = useState<DiffModeEnum>(DiffModeEnum.Unified);
  const files = useMemo(() => splitGitDiff(data?.diff ?? ''), [data?.diff]);

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col text-gray-100">
      <ReviewHeader
        baseBranch={data?.baseBranch}
        mode={mode}
        newBranch={data?.newBranch}
        projectId={projectId}
        onModeChange={setMode}
      />

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <ReviewContent
          error={error}
          files={files}
          isEmpty={data?.isEmpty}
          isLoading={isLoading}
          mode={mode}
        />
      </div>
    </section>
  );
}
