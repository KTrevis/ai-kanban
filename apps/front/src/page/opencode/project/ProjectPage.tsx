import { SessionMessages } from '#/components/opencode/messages/SessionMessages';
import { ProjectList } from '#/components/opencode/ProjectList';
import {
  kanbanCardsQueryKey,
  setStoredKanbanCards,
  useGetKanbanCards,
} from '#/hooks/queries/kanban/kanban.queries';
import { KanbanPage } from '#/page/kanban/KanbanPage';
import { useQueryClient } from '@tanstack/react-query';

export function ProjectPage({
  projectId,
  sessionId,
}: {
  projectId: string;
  sessionId?: string;
}) {
  const queryClient = useQueryClient();
  const { data: cards } = useGetKanbanCards(projectId);

  return (
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      {sessionId ? (
        <SessionMessages id={sessionId} />
      ) : (
        <KanbanPage
          cards={cards ?? []}
          projectId={projectId}
          onCardMoved={({ cards }) => {
            queryClient.setQueryData(kanbanCardsQueryKey(projectId), cards);
            setStoredKanbanCards(projectId, cards);
          }}
        />
      )}
    </div>
  );
}
