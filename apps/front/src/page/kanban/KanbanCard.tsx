import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import type { KanbanCard as KanbanCardType } from '#/hooks/queries/kanban/kanban.queries';
import MarkdownPreview from '@uiw/react-markdown-preview';
const OPENCODE_URL =
  import.meta.env.VITE_OPENCODE_URL ?? 'http://localhost:4096';

export function KanbanCard({
  card,
  isOverlay,
  onClick,
}: {
  card: KanbanCardType;
  isOverlay?: boolean;
  onClick?: () => void;
}) {
  const { data: projects = [] } = useGetProjects();
  const project = projects.find((project) => project.id === card.projectId);
  const sessionUrl =
    card.sessionId && project?.worktree
      ? `${OPENCODE_URL}/${encodeBase64Url(project.worktree)}/session/${card.sessionId}`
      : null;

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
          style={{ background: 'transparent' }}
        />
      </div>
      {sessionUrl && (
        <a
          className="mt-3 inline-flex font-medium text-cyan-300 hover:text-cyan-200"
          href={sessionUrl}
          onClick={(event) => event.stopPropagation()}
          rel="noreferrer"
          target="_blank"
        >
          Open session
        </a>
      )}
    </article>
  );
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    '',
  );

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
