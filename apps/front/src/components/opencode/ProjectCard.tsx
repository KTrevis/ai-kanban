import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '#/components/ui/context-menu';
import type { Project } from '#/hooks/queries/opencode/project.queries';
import { cn } from '#/lib/utils';
import { useNavigate } from '@tanstack/react-router';

export function ProjectCard({
  onHide,
  project,
  selectedProject,
}: {
  onHide: () => void;
  project: Project;
  selectedProject?: string;
}) {
  const firstChar = Array.from(project.name ?? '')[0];
  const navigate = useNavigate();

  if (!firstChar) {
    return null;
  }

  const card = (
    <div
      onClick={() =>
        navigate({ to: '/project/$id', params: { id: project.id } })
      }
      className={cn(
        'w-fit cursor-pointer rounded-sm border border-gray-700 px-2 py-1',
        {
          'bg-blue-500': selectedProject === project.id,
        },
      )}
    >
      {firstChar}
    </div>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{card}</ContextMenuTrigger>
      <ContextMenuContent className="border-gray-700 bg-gray-800 text-white">
        <ContextMenuItem
          className="cursor-pointer focus:bg-gray-700 focus:text-white"
          onSelect={onHide}
        >
          Hide project
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
