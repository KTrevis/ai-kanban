import type { Project } from '#/hooks/queries/opencode/project.queries';
import { cn } from '#/lib/utils';
import { useNavigate } from '@tanstack/react-router';

export function ProjectCard({
  onHide,
  project,
  selectedProject,
}: {
  onHide?: () => void;
  project: Project;
  selectedProject?: string;
}) {
  const firstChar = Array.from(project.name ?? '')[0];
  const navigate = useNavigate();

  if (!firstChar) {
    return null;
  }
  return (
    <div
      onClick={() =>
        navigate({ to: '/project/$id', params: { id: project.id } })
      }
      className={cn(
        'group flex w-fit cursor-pointer items-center gap-1 rounded-sm border border-gray-700 px-2 py-1',
        {
          'bg-blue-500': selectedProject === project.id,
        },
      )}
    >
      <span>{firstChar}</span>
      {onHide ? (
        <button
          aria-label={`Hide ${project.name ?? 'project'}`}
          className="rounded px-1 text-xs text-gray-400 opacity-0 hover:bg-gray-700 hover:text-white group-hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            onHide();
          }}
          type="button"
        >
          -
        </button>
      ) : null}
    </div>
  );
}
