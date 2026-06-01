import { ProjectList } from '#/components/opencode/ProjectList';
import { useCreateCardSession } from '#/hooks/mutations/opencode/session.mutations';
import {
  type KanbanCard,
  useGetKanbanCards,
  useMoveKanbanCards,
} from '#/hooks/mutations/kanban/kanban.mutations';
import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import type { CardMovedEvent } from '#/page/kanban/KanbanPage';
import { useEffect } from 'react';
import { ProjectContent } from './ProjectContent';

export function ProjectPage({
  cardId,
  onCardIdChange,
  projectId,
}: {
  cardId?: string;
  onCardIdChange: (cardId?: string) => void;
  projectId: string;
}) {
  const { data: cards } = useGetKanbanCards(projectId);
  const { data: projects = [] } = useGetProjects();
  const { mutate: moveCards } = useMoveKanbanCards(projectId);
  const { mutate: createCardSession } = useCreateCardSession();
  const project = projects.find((project) => project.id === projectId);
  const projectFirstChar = Array.from(project?.name ?? '')[0];

  useEffect(() => {
    document.title = projectFirstChar
      ? `${projectFirstChar} - Kanban`
      : 'Travaille - Kanban';
  }, [projectFirstChar]);

  function onCardMoved({ card, cards }: CardMovedEvent) {
    if (card.column === 'AI') {
      createCardSession({ cardId: card.id });
    }
    moveCards(
      cards.map((card, position) => ({
        column: card.column,
        id: card.id,
        position,
        projectId: card.projectId,
      })),
    );
  }

  function onCardCreated(card: KanbanCard) {
    if (card.column === 'AI') {
      createCardSession({ cardId: card.id });
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      <ProjectContent
        cards={cards ?? []}
        cardId={cardId}
        projectId={projectId}
        projectWorktree={project?.worktree}
        onCardCreated={onCardCreated}
        onCardIdChange={onCardIdChange}
        onCardMoved={onCardMoved}
      />
    </div>
  );
}
