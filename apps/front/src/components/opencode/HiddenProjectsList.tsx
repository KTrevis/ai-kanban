import { Button } from '#/components/ui/button';
import type { Project } from '#/hooks/queries/opencode/project.queries';

export function HiddenProjectsList({
  hiddenProjects,
  onShowProject,
}: {
  hiddenProjects: Array<Project>;
  onShowProject: (projectId: string) => void;
}) {
  if (hiddenProjects.length === 0) {
    return <p className="text-sm text-gray-300">No hidden project.</p>;
  }

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto">
      {hiddenProjects.map((project) => (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-gray-800/60 p-3"
          key={project.id}
        >
          <span className="truncate text-sm text-gray-100">
            {project.name ?? project.id}
          </span>
          <Button onClick={() => onShowProject(project.id)} type="button">
            Show
          </Button>
        </div>
      ))}
    </div>
  );
}
