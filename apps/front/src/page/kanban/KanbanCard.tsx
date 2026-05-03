import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import type { KanbanCard as KanbanCardType } from '#/hooks/queries/kanban/kanban.queries';
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
      className={`cursor-grab rounded-xl border border-white/10 bg-gray-800 p-4 shadow-lg shadow-black/20 active:cursor-grabbing text-sm ${
        isOverlay ? 'rotate-2 ring-2 ring-cyan-300' : ''
      }`}
    >
      <h3 className="font-medium text-gray-50">{card.title}</h3>
      <p className="mt-2 text-sm leading-5 text-gray-400">{card.description}</p>
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
