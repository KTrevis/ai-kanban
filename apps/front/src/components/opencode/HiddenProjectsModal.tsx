import { Modal } from '#/components/Modal';
import { DialogDescription, DialogTitle } from '#/components/ui/dialog';
import type { Project } from '#/hooks/queries/opencode/project.queries';
import { HiddenProjectsList } from './HiddenProjectsList';

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

        <HiddenProjectsList
          hiddenProjects={hiddenProjects}
          onShowProject={onShowProject}
        />
      </div>
    </Modal>
  );
}
