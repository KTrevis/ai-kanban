import type { KanbanCard as KanbanCardType } from '#/hooks/mutations/kanban/kanban.mutations';
import { getOpencodeSessionUrl } from '#/lib/opencode-session-url';
import { Link } from '@tanstack/react-router';
import { GitPullRequest, MessageCircle } from 'lucide-react';

export function KanbanCard({
  card,
  isOverlay,
  onClick,
  projectWorktree,
}: {
  card: KanbanCardType;
  isOverlay?: boolean;
  onClick?: () => void;
  projectWorktree?: string;
}) {
  const actionClassName =
    'inline-flex size-8 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white';
  const sessionUrl =
    card.sessionId && projectWorktree
      ? getOpencodeSessionUrl({
          projectDirectory: projectWorktree,
          sessionId: card.sessionId,
        })
      : undefined;

  return (
    <article
      onClick={onClick}
      className={`relative cursor-grab overflow-hidden rounded-xl border border-white/10 bg-gray-800 p-4 text-sm shadow-lg shadow-black/20 active:cursor-grabbing ${
        isOverlay ? 'rotate-2 ring-2 ring-cyan-300' : ''
      }`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {sessionUrl && (
          <a
            href={sessionUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open session"
            className={actionClassName}
            onClick={(event) => event.stopPropagation()}
            title="Open session"
          >
            <MessageCircle className="size-4" />
          </a>
        )}
        {card.newBranch && (
          <Link
            to="/review/$cardId"
            params={{ cardId: card.id }}
            aria-label="Review changes"
            className={actionClassName}
            onClick={(event) => event.stopPropagation()}
            title="Review changes"
          >
            <GitPullRequest className="size-4" />
          </Link>
        )}
      </div>
      <h3 className="break-words pr-20 font-medium text-gray-50">
        {card.title}
      </h3>
      {card.description && (
        <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-gray-400 [overflow-wrap:anywhere]">
          {card.description}
        </p>
      )}
    </article>
  );
}
