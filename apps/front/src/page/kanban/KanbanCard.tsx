import type { KanbanCard as KanbanCardType } from '#/hooks/queries/kanban/kanban.queries';
import { Link } from '@tanstack/react-router';
import MarkdownPreview from '@uiw/react-markdown-preview';

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
      <div className="mt-2 max-h-64 overflow-y-auto break-words pr-1 [overflow-wrap:anywhere]">
        <MarkdownPreview
          className="kanban-card-markdown"
          source={card.description}
          style={{ background: 'transparent', fontSize: 14 }}
        />
      </div>
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
        {card.newBranch && (
          <Link
            to={`/project/$id`}
            params={{ id: card.projectId }}
            search={{ reviewCardId: card.id }}
            className="inline-flex font-medium text-violet-300 hover:text-violet-200"
            onClick={(event) => event.stopPropagation()}
          >
            Review changes
          </Link>
        )}
      </div>
    </article>
  );
}
