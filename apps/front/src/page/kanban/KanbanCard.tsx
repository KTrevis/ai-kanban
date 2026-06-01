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
        {sessionUrl && (
          <a
            href={sessionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex font-medium text-cyan-300 hover:text-cyan-200"
          >
            <MessageCircle className="size-4" />
          </a>
        )}
        {card.newBranch && (
          <Link
            to="/review/$cardId"
            params={{ cardId: card.id }}
            aria-label="Review changes"
            className="inline-flex size-8 items-center justify-center rounded-lg text-purple-300 transition hover:bg-white/10 hover:text-purple-200"
            onClick={(event) => event.stopPropagation()}
            title="Review changes"
          >
            <GitPullRequest className="size-4" />
          </Link>
        )}
      </div>
    </article>
  );
}
