import type { Project } from '#/hooks/queries/opencode/project.queries';
import { cn } from '#/lib/utils';
import { useNavigate } from '@tanstack/react-router';

export function ProjectCard({
  project,
  selectedProject,
}: {
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
        'border border-gray-700 rounded-sm px-2 py-1 w-fit cursor-pointer',
        {
          'bg-blue-500': selectedProject === project.id,
        },
      )}
    >
      {firstChar}
    </div>
  );
}
