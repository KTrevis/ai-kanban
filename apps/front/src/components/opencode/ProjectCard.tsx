import type { Project } from '#/hooks/queries/opencode/project.queries';
import { useNavigate } from '@tanstack/react-router';

export function ProjectCard({ project }: { project: Project }) {
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
      className="border border-gray-700 rounded-sm px-2 py-1 w-fit cursor-pointer"
    >
      {firstChar}
    </div>
  );
}
