import { Button } from '#/components/ui/button';
import type { KanbanCard } from '#/hooks/mutations/kanban copy/kanban.queries';
import { Link } from '@tanstack/react-router';

export function ProjectSessionReviewBar({ card }: { card?: KanbanCard }) {
  console.log(card?.newBranch);
  if (!card?.newBranch) {
    return null;
  }

  return (
    <div className="border-b border-gray-700 p-2 flex justify-between">
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
