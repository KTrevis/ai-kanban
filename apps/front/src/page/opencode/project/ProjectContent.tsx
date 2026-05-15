import type { KanbanCard } from '#/hooks/queries/kanban/kanban.queries';
import { KanbanPage, type CardMovedEvent } from '#/page/kanban/KanbanPage';
import { ProjectSessionPanel } from './ProjectSessionPanel';
import { ReviewPage } from './ReviewPage';

export function ProjectContent({
  cardId,
  cards,
  onCardCreated,
  onCardIdChange,
  onCardMoved,
  projectId,
  reviewCardId,
  sessionId,
}: {
  cardId?: string;
  cards: KanbanCard[];
  onCardCreated: (card: KanbanCard) => void;
  onCardIdChange: (cardId?: string) => void;
  onCardMoved: (event: CardMovedEvent) => void;
  projectId: string;
  reviewCardId?: string;
  sessionId?: string;
}) {
  if (reviewCardId) {
    return <ReviewPage cardId={reviewCardId} projectId={projectId} />;
  }

  if (sessionId) {
    return <ProjectSessionPanel projectId={projectId} sessionId={sessionId} />;
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
