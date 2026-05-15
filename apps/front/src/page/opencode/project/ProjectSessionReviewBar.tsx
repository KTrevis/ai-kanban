import { Button } from '#/components/ui/button';
import type { KanbanCard } from '#/hooks/queries/kanban/kanban.queries';
import { Link } from '@tanstack/react-router';

export function ProjectSessionReviewBar({ card }: { card?: KanbanCard }) {
  if (!card?.newBranch) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 backdrop-blur-xs">
      <div></div>
      <Button
        asChild
        className="pointer-events-auto shrink-0"
        variant="outline"
      >
        <Link to="/review/$cardId" params={{ cardId: card.id }}>
          Review changes
        </Link>
      </Button>
    </div>
  );
}
