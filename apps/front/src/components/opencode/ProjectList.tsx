import { Modal } from '#/components/Modal';
import { Button } from '#/components/ui/button';
import { DialogDescription, DialogTitle } from '#/components/ui/dialog';
import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProjectCard } from './ProjectCard';

const HIDDEN_PROJECTS_STORAGE_KEY = 'travaille.hiddenProjects';

function readHiddenProjects() {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const value = window.localStorage.getItem(HIDDEN_PROJECTS_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];

    return Array.isArray(parsed)
      ? parsed.filter((projectId): projectId is string => typeof projectId === 'string')
      : [];
  } catch {
    return [] as string[];
  }
}

export function ProjectList({ selectedProject }: { selectedProject?: string }) {
  const { data: projects = [] } = useGetProjects();
  const [hiddenProjectIds, setHiddenProjectIds] = useState(readHiddenProjects);
  const [showHiddenProjects, setShowHiddenProjects] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      HIDDEN_PROJECTS_STORAGE_KEY,
      JSON.stringify(hiddenProjectIds),
    );
  }, [hiddenProjectIds]);

  const hiddenProjectIdSet = new Set(hiddenProjectIds);
  const visibleProjects = projects.filter(
    (project) => !hiddenProjectIdSet.has(project.id),
  );
  const hiddenProjects = projects.filter((project) =>
    hiddenProjectIdSet.has(project.id),
  );

  function hideProject(projectId: string) {
    setHiddenProjectIds((current) =>
      current.includes(projectId) ? current : [...current, projectId],
    );
  }

  function showProject(projectId: string) {
    setHiddenProjectIds((current) =>
      current.filter((currentProjectId) => currentProjectId !== projectId),
    );
  }

  return (
    <div className="flex h-full min-h-0 w-fit shrink-0 flex-col gap-2 overflow-y-auto border-r border-gray-700 p-2">
      <button
        aria-label="Show hidden projects"
        className="flex h-8 w-8 items-center justify-center rounded-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        disabled={hiddenProjects.length === 0}
        onClick={() => setShowHiddenProjects(true)}
        type="button"
      >
        <Plus size={16} />
      </button>

      {visibleProjects.map((curr) => (
        <ProjectCard
          key={curr.id}
          onHide={() => hideProject(curr.id)}
          project={curr}
          selectedProject={selectedProject}
        />
      ))}

      <Modal open={showHiddenProjects} onOpenChange={setShowHiddenProjects}>
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
                  <Button onClick={() => showProject(project.id)} type="button">
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
    </div>
  );
}
