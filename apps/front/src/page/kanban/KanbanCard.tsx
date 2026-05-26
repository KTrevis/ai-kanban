import type { KanbanCard as KanbanCardType } from '#/hooks/mutations/kanban/kanban.mutations';
import { Link } from '@tanstack/react-router';

export function KanbanCard({
  card,
  isOverlay,
  onClick,
}: {
  card: KanbanCardType;
  isOverlay?: boolean;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className={`cursor-grab overflow-hidden rounded-xl border border-white/10 bg-gray-800 p-4 text-sm shadow-lg shadow-black/20 active:cursor-grabbing ${
        isOverlay ? 'rotate-2 ring-2 ring-cyan-300' : ''
      }`}
    >
      <h3 className="break-words font-medium text-gray-50">{card.title}</h3>
      {card.description && (
        <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-gray-400 [overflow-wrap:anywhere]">
          {card.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        {card.sessionId && (
          <Link
            to={`/project/$id`}
            params={{ id: card.projectId }}
            search={{ sessionId: card.sessionId }}
            className="inline-flex font-medium text-cyan-300 hover:text-cyan-200"
            onClick={(event) => event.stopPropagation()}
          >
            Open session
          </Link>
        )}
      </div>
    </article>
  );
}
