import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CreateKanbanCardDialog } from './CreateKanbanCardModal';
import { SortableKanbanCard } from './SortableKanbanCard';
import type { Card, Column } from './kanban.types';

export function KanbanColumn({
  cards,
  column,
  onCardClick,
  projectId,
}: {
  cards: Card[];
  column: Column;
  onCardClick?: (card: Card) => void;
  projectId: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column });

  return (
    <section
      className={`flex min-h-130 flex-col rounded-2xl border bg-gray-900/80 p-3 ${
        isOver ? 'border-cyan-400' : 'border-white/10'
      }`}
      ref={setNodeRef}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-200">
          {column}
        </h2>
        <div className="flex items-center justify-center">
          <span className="rounded-full bg-white/10 size-5 text-xs text-gray-300 items-center justify-center flex">
            {cards.length}
          </span>
          <CreateKanbanCardDialog column={column} projectId={projectId} />
        </div>
      </div>

      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3">
          {cards.map((card) => (
            <SortableKanbanCard
              card={card}
              key={card.id}
              onClick={onCardClick}
            />
          ))}

          {cards.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
              Drop here
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  );
}
