import {
  type Project,
  useDeleteProject,
} from '#/hooks/queries/opencode/project.queries';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '#/components/ui/context-menu';
import { cn } from '#/lib/utils';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export function ProjectCard({
  project,
  selectedProject,
}: {
  project: Project;
  selectedProject?: string;
}) {
  const firstChar = getFirstGrapheme(project.name ?? '');
  const navigate = useNavigate();
  const { isPending: isDeletingProject, mutate: deleteProject } =
    useDeleteProject(project.id);

  if (!firstChar) {
    return null;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          to="/project/$id"
          params={{ id: project.id }}
          className={cn(
            'w-fit cursor-pointer rounded-sm border border-gray-700 px-2 py-1',
            {
              'bg-blue-500': selectedProject === project.id,
            },
          )}
        >
          {firstChar}
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          disabled={isDeletingProject}
          variant="destructive"
          onSelect={() => {
            deleteProject(undefined, {
              onError(error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to delete project',
                );
              },
              onSuccess() {
                toast.success('Project deleted');
                if (selectedProject === project.id) {
                  navigate({ to: '/project' });
                }
              },
            });
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function getFirstGrapheme(value: string) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return segmenter.segment(value)[Symbol.iterator]().next().value?.segment;
}
