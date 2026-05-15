import type { KanbanCard } from '#/hooks/queries/kanban/kanban.queries';
import { KanbanPage, type CardMovedEvent } from '#/page/kanban/KanbanPage';
import { ProjectSessionPanel } from './ProjectSessionPanel';

export function ProjectContent({
  cardId,
  cards,
  onCardCreated,
  onCardIdChange,
  onCardMoved,
  projectId,
  sessionId,
}: {
  cardId?: string;
  cards: KanbanCard[];
  onCardCreated: (card: KanbanCard) => void;
  onCardIdChange: (cardId?: string) => void;
  onCardMoved: (event: CardMovedEvent) => void;
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
      projectId={projectId}
      onCardIdChange={onCardIdChange}
      onCardCreated={onCardCreated}
      onCardMoved={onCardMoved}
    />
  );
}
