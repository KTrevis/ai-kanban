import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanCard as KanbanCardType } from '#/hooks/mutations/kanban/kanban.mutations';
import { KanbanCard } from './KanbanCard';

export function SortableKanbanCard({
  card,
  onClick,
  projectWorktree,
}: {
  card: KanbanCardType;
  onClick?: (card: KanbanCardType) => void;
  projectWorktree?: string;
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
      <KanbanCard
        card={card}
        onClick={() => onClick?.(card)}
        projectWorktree={projectWorktree}
      />
    </div>
  );
}
