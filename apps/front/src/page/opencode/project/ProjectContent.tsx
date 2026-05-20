import type { KanbanCard } from '#/hooks/queries/kanban/kanban.queries';
import { KanbanPage, type CardMovedEvent } from '#/page/kanban/KanbanPage';
import { ProjectSessionPanel } from './ProjectSessionPanel';

export function ProjectContent({
  cardId,
  cards,
  isProjectSessionStarting,
  onCardCreated,
  onCardIdChange,
  onCardMoved,
  onProjectSessionStart,
  projectId,
  sessionId,
}: {
  cardId?: string;
  cards: KanbanCard[];
  isProjectSessionStarting: boolean;
  onCardCreated: (card: KanbanCard) => void;
  onCardIdChange: (cardId?: string) => void;
  onCardMoved: (event: CardMovedEvent) => void;
  onProjectSessionStart: () => void;
  projectId: string;
  sessionId?: string;
}) {
  if (sessionId) {
    const sessionCard = cards.find((card) => card.sessionId === sessionId);

    return (
      <ProjectSessionPanel
        card={sessionCard}
        projectId={projectId}
        sessionId={sessionId}
      />
    );
  }

  return (
    <KanbanPage
      cards={cards}
      cardId={cardId}
      isProjectSessionStarting={isProjectSessionStarting}
      projectId={projectId}
      onCardIdChange={onCardIdChange}
      onCardCreated={onCardCreated}
      onCardMoved={onCardMoved}
      onProjectSessionStart={onProjectSessionStart}
    />
  );
}
