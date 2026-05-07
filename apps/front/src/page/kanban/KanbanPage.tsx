import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  CollisionDetection,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import type { KanbanCard as KanbanCardType } from '#/hooks/queries/kanban/kanban.queries';
import { useEffect, useState } from 'react';
import { Modal } from '#/components/Modal';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn } from './KanbanColumn';
import { CreateKanbanCardModalContent } from './CreateKanbanCardModalContent';
import { moveCard } from './kanban.move';
import { KANBAN_COLUMNS } from './kanban.types';
import type { Column } from './kanban.types';

export type CardMovedEvent = {
  card: KanbanCardType;
  cards: KanbanCardType[];
  fromColumn: Column;
  fromIndex: number;
  toColumn: Column;
  toIndex: number;
};

type KanbanPageProps = {
  cardId?: string;
  onCardIdChange: (cardId?: string) => void;
  onCardCreated?: (card: KanbanCardType) => void;
  onCardMoved?: (event: CardMovedEvent) => void;
  cards: KanbanCardType[];
  projectId: string;
};

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  return pointerCollisions.length > 0
    ? pointerCollisions
    : closestCorners(args);
};

export function KanbanPage({
  cardId,
  onCardIdChange,
  onCardCreated,
  onCardMoved,
  cards,
  projectId,
}: KanbanPageProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState(cards);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  useEffect(() => {
    setVisibleCards(cards);
  }, [cards]);

  const activeCard =
    visibleCards.find((card) => card.id === activeCardId) ?? null;
  const editingCard = visibleCards.find((card) => card.id === cardId) ?? null;

  const getColumnCards = (column: Column) =>
    visibleCards.filter((card) => card.column === column);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveCardId(String(active.id));
  };

  const handleDragCancel = () => {
    setActiveCardId(null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCardId(null);

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeTop = active.rect.current.translated?.top;
    const overMiddle = over.rect.top + over.rect.height / 2;
    const shouldInsertAfter =
      activeTop == null ? false : activeTop > overMiddle;

    const fromIndex = visibleCards.findIndex((card) => card.id === activeId);

    if (fromIndex === -1) {
      return;
    }

    const card = visibleCards[fromIndex];
    const nextCards = moveCard({
      activeId,
      cards: visibleCards,
      overId,
      shouldInsertAfter,
    });

    if (nextCards === visibleCards) {
      return;
    }

    setVisibleCards(nextCards);

    const toIndex = nextCards.findIndex((nextCard) => nextCard.id === activeId);

    onCardMoved?.({
      card: nextCards[toIndex],
      cards: nextCards,
      fromColumn: card.column,
      fromIndex,
      toColumn: nextCards[toIndex].column,
      toIndex,
    });
  };

  return (
    <DndContext
      collisionDetection={kanbanCollisionDetection}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="h-full overflow-auto p-6 text-white flex-1">
        <div className="grid min-w-220 grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnCards = getColumnCards(column);

            return (
              <KanbanColumn
                cards={columnCards}
                column={column}
                key={column}
                onCardClick={(card) => onCardIdChange(card.id)}
                onCardCreated={onCardCreated}
                projectId={projectId}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
      </DragOverlay>

      <Modal
        open={editingCard != null}
        onOpenChange={(open) => {
          if (!open) {
            onCardIdChange(undefined);
          }
        }}
      >
        {editingCard ? (
          <CreateKanbanCardModalContent
            card={editingCard}
            column={editingCard.column}
            onOpenChange={(open) => {
              if (!open) {
                onCardIdChange(undefined);
              }
            }}
            projectId={projectId}
          />
        ) : null}
      </Modal>
    </DndContext>
  );
}
