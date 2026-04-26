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
import { useEffect, useState } from 'react';
import { Modal } from '#/components/Modal';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn } from './KanbanColumn';
import { CreateKanbanCardModalContent } from './CreateKanbanCardModalContent';
import { moveCard } from './kanban.move';
import { KANBAN_COLUMNS } from './kanban.types';
import type { Card, Column } from './kanban.types';

export type CardMovedEvent = {
  card: Card;
  cards: Card[];
  fromColumn: Column;
  fromIndex: number;
  toColumn: Column;
  toIndex: number;
};

type KanbanPageProps = {
  onCardMoved?: (event: CardMovedEvent) => void;
  cards: Card[];
  projectId: string;
};

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  return pointerCollisions.length > 0 ? pointerCollisions : closestCorners(args);
};

export function KanbanPage({ onCardMoved, cards, projectId }: KanbanPageProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
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
      <div className="h-full overflow-auto p-6 text-white">
        <div className="grid min-w-220 grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnCards = getColumnCards(column);

            return (
              <KanbanColumn
                cards={columnCards}
                column={column}
                key={column}
                onCardClick={setEditingCard}
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
            setEditingCard(null);
          }
        }}
      >
        {editingCard ? (
          <CreateKanbanCardModalContent
            card={editingCard}
            column={editingCard.column}
            onOpenChange={(open) => {
              if (!open) {
                setEditingCard(null);
              }
            }}
            projectId={projectId}
          />
        ) : null}
      </Modal>
    </DndContext>
  );
}
