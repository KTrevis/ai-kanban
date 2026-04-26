import { arrayMove } from '@dnd-kit/sortable';
import type { KanbanCard } from '#/hooks/queries/kanban/kanban.queries';
import type { Column } from './kanban.types';
import { isColumn } from './kanban.utils';

export function moveCard({
  activeId,
  cards,
  overId,
  shouldInsertAfter,
}: {
  activeId: string;
  cards: KanbanCard[];
  overId: string;
  shouldInsertAfter: boolean;
}) {
  const targetColumn = getTargetColumn(overId, cards);

  if (!targetColumn) {
    return cards;
  }

  const activeIndex = cards.findIndex((card) => card.id === activeId);
  const overIndex = cards.findIndex((card) => card.id === overId);

  if (activeIndex === -1) {
    return cards;
  }

  const movingCard = cards[activeIndex];

  if (activeIndex === overIndex) {
    return cards;
  }

  if (movingCard.column === targetColumn && overIndex !== -1) {
    return arrayMove(cards, activeIndex, overIndex);
  }

  const withoutMovingCard = cards.filter((card) => card.id !== activeId);
  const insertIndex = getInsertIndex({
    cards: withoutMovingCard,
    overId,
    shouldInsertAfter,
    targetColumn,
  });

  const nextCards = [...withoutMovingCard];
  nextCards.splice(insertIndex === -1 ? nextCards.length : insertIndex, 0, {
    ...movingCard,
    column: targetColumn,
  });

  return nextCards;
}

function getTargetColumn(overId: string, cards: KanbanCard[]): Column | null {
  if (isColumn(overId)) {
    return overId;
  }

  return cards.find((card) => card.id === overId)?.column ?? null;
}

function getInsertIndex({
  cards,
  overId,
  shouldInsertAfter,
  targetColumn,
}: {
  cards: KanbanCard[];
  overId: string;
  shouldInsertAfter: boolean;
  targetColumn: Column;
}) {
  if (isColumn(overId)) {
    let lastColumnCardIndex = -1;

    for (const [index, card] of cards.entries()) {
      if (card.column === targetColumn) {
        lastColumnCardIndex = index;
      }
    }

    return lastColumnCardIndex === -1 ? cards.length : lastColumnCardIndex + 1;
  }

  const overIndex = cards.findIndex((card) => card.id === overId);

  return overIndex === -1 || !shouldInsertAfter ? overIndex : overIndex + 1;
}
