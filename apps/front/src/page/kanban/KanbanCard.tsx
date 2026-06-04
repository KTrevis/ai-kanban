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
    'inline-flex size-8 items-center justify-center rounded-lg transition hover:bg-white/10';
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
      <h3 className="wrap-break-word font-medium text-gray-50">{card.title}</h3>
      {card.description && (
        <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap wrap-break-word pr-1 text-gray-400">
          {card.description}
        </p>
      )}
      {sessionUrl && (
        <a
          href={sessionUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open session"
          className={`${actionClassName} text-cyan-300 hover:text-cyan-200`}
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
          className={`${actionClassName} text-purple-300 hover:text-purple-200`}
          onClick={(event) => event.stopPropagation()}
          title="Review changes"
        >
          <GitPullRequest className="size-4" />
        </Link>
      )}
    </article>
  );
}
