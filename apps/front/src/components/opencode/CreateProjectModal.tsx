import { Modal } from '#/components/Modal';
import { Button } from '#/components/ui/button';
import { DialogDescription, DialogTitle } from '#/components/ui/dialog';
import { useCreateProject } from '#/hooks/queries/opencode/project.queries';
import { useState, type SubmitEventHandler } from 'react';

export function CreateProjectModal({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { isPending, mutate: createProject } = useCreateProject();
  const [name, setName] = useState('');
  const [directory, setDirectory] = useState('');

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDirectory = directory.trim();

    if (!trimmedName || !trimmedDirectory) {
      return;
    }

    createProject(
      {
        name: trimmedName,
        worktree: trimmedDirectory,
      },
      {
        onSuccess() {
          setName('');
          setDirectory('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="space-y-5">
        <div className="space-y-1">
          <DialogTitle className="text-lg text-white">
            Create project
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Add a project to the local project list.
          </DialogDescription>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm font-medium text-gray-100">
            <span>Project name</span>
            <input
              autoFocus
              className="w-full rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
              onChange={(event) => setName(event.target.value)}
              placeholder="travaille"
              value={name}
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-gray-100">
            <span>Project directory</span>
            <input
              className="w-full rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
              onChange={(event) => setDirectory(event.target.value)}
              placeholder="/Users/galadrim/dev/travaille"
              value={directory}
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={!name.trim() || !directory.trim() || isPending}
              type="submit"
            >
              {isPending ? 'Creating...' : 'Create project'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
