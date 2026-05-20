import { ProjectList } from '#/components/opencode/ProjectList';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import {
  type KanbanCard,
  useGetKanbanCards,
  useMoveKanbanCards,
} from '#/hooks/queries/kanban/kanban.queries';
import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import type { CardMovedEvent } from '#/page/kanban/KanbanPage';
import { useEffect } from 'react';
import { ProjectContent } from './ProjectContent';

export function ProjectPage({
  cardId,
  onCardIdChange,
  projectId,
  sessionId,
}: {
  cardId?: string;
  onCardIdChange: (cardId?: string) => void;
  projectId: string;
  sessionId?: string;
}) {
  const { data: cards } = useGetKanbanCards(projectId);
  const { data: projects = [] } = useGetProjects();
  const { mutate: moveCards } = useMoveKanbanCards(projectId);
  const { mutate: sendSessionMessage } = useSendSessionMessage();
  const project = projects.find((project) => project.id === projectId);
  const projectFirstChar = Array.from(project?.name ?? '')[0];

  useEffect(() => {
    const page = sessionId ? 'Chat' : 'Kanban';
    document.title = projectFirstChar
      ? `${projectFirstChar} - ${page}`
      : `Travaille - ${page}`;
  }, [projectFirstChar, sessionId]);

  function startAgentSession(card: KanbanCard) {
    sendSessionMessage({
      cardId: card.id,
    });
  }

  function onCardMoved({ card, cards }: CardMovedEvent) {
    if (card.column === 'AI') {
      startAgentSession(card);
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
      startAgentSession(card);
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      <ProjectContent
        cards={cards ?? []}
        cardId={cardId}
        projectId={projectId}
        sessionId={sessionId}
        onCardCreated={onCardCreated}
        onCardIdChange={onCardIdChange}
        onCardMoved={onCardMoved}
      />
    </div>
  );
}
