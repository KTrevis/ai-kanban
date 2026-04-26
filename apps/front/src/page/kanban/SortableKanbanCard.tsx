import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanCard as KanbanCardType } from '#/hooks/queries/kanban/kanban.queries';
import { KanbanCard } from './KanbanCard';

export function SortableKanbanCard({
  card,
  onClick,
}: {
  card: KanbanCardType;
  onClick?: (card: KanbanCardType) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard card={card} onClick={() => onClick?.(card)} />
    </div>
  );
}
