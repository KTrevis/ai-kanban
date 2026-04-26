import { SessionMessages } from '#/components/opencode/messages/SessionMessages';
import { ProjectList } from '#/components/opencode/ProjectList';
import {
  KANBAN_CARDS_QUERY_KEY,
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
  const { data: cards } = useGetKanbanCards();

  return (
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      {/*{data && (
        <SessionList
          sessions={data.sessions}
          onSessionClick={(session) =>
            navigate({
              to: '/project/$id',
              params: { id: projectId },
              search: { sessionId: session.id },
            })
          }
        />
      )}*/}
      {sessionId ? (
        <SessionMessages id={sessionId} />
      ) : (
        <KanbanPage
          cards={cards ?? []}
          onCardMoved={({ cards }) =>
            queryClient.setQueryData(KANBAN_CARDS_QUERY_KEY, cards)
          }
        />
      )}
    </div>
  );
}
