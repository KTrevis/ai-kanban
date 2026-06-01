import type { KanbanCard } from '#/hooks/mutations/kanban/kanban.mutations';
import { KanbanPage, type CardMovedEvent } from '#/page/kanban/KanbanPage';

export function ProjectContent({
  cardId,
  cards,
  isProjectSessionStarting,
  onCardCreated,
  onCardIdChange,
  onCardMoved,
  onProjectSessionStart,
  projectId,
  projectWorktree,
}: {
  cardId?: string;
  cards: KanbanCard[];
  isProjectSessionStarting: boolean;
  onCardCreated: (card: KanbanCard) => void;
  onCardIdChange: (cardId?: string) => void;
  onCardMoved: (event: CardMovedEvent) => void;
  onProjectSessionStart: () => void;
  projectId: string;
  projectWorktree?: string;
}) {
  return (
    <KanbanPage
      cards={cards}
      cardId={cardId}
      isProjectSessionStarting={isProjectSessionStarting}
      projectId={projectId}
      projectWorktree={projectWorktree}
      onCardIdChange={onCardIdChange}
      onCardCreated={onCardCreated}
      onCardMoved={onCardMoved}
      onProjectSessionStart={onProjectSessionStart}
    />
  );
}
