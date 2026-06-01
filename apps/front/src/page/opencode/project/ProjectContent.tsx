import type { KanbanCard } from '#/hooks/mutations/kanban/kanban.mutations';
import { KanbanPage, type CardMovedEvent } from '#/page/kanban/KanbanPage';

export function ProjectContent({
  cardId,
  cards,
  onCardCreated,
  onCardIdChange,
  onCardMoved,
  projectId,
  projectWorktree,
}: {
  cardId?: string;
  cards: KanbanCard[];
  onCardCreated: (card: KanbanCard) => void;
  onCardIdChange: (cardId?: string) => void;
  onCardMoved: (event: CardMovedEvent) => void;
  projectId: string;
  projectWorktree?: string;
}) {
  return (
    <KanbanPage
      cards={cards}
      cardId={cardId}
      projectId={projectId}
      projectWorktree={projectWorktree}
      onCardIdChange={onCardIdChange}
      onCardCreated={onCardCreated}
      onCardMoved={onCardMoved}
    />
  );
}
