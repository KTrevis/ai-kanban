import { Modal } from '#/components/Modal';
import { Button } from '#/components/ui/button';
import { DialogDescription, DialogTitle } from '#/components/ui/dialog';
import type { Project } from '#/hooks/queries/opencode/project.queries';

export function HiddenProjectsModal({
  hiddenProjects,
  onOpenChange,
  onShowProject,
  open,
}: {
  hiddenProjects: Array<Project>;
  onOpenChange: (open: boolean) => void;
  onShowProject: (projectId: string) => void;
  open: boolean;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="space-y-5">
        <div className="space-y-1">
          <DialogTitle className="text-lg text-white">
            Hidden projects
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Restore a project to show it again in the project list.
          </DialogDescription>
        </div>

        {hiddenProjects.length > 0 ? (
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
        ) : (
          <p className="text-sm text-gray-300">No hidden project.</p>
        )}
      </div>
    </Modal>
  );
}
