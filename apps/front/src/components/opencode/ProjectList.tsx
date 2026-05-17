import {
  useGetHiddenProjectIds,
  useGetProjects,
  useUpdateHiddenProjectIds,
} from '#/hooks/queries/opencode/project.queries';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { HiddenProjectsModal } from './HiddenProjectsModal';
import { ProjectCard } from './ProjectCard';

export function ProjectList({ selectedProject }: { selectedProject?: string }) {
  const { data: projects = [] } = useGetProjects();
  const { data: hiddenProjectIds = [] } = useGetHiddenProjectIds();
  const { mutate: updateHiddenProjectIds } = useUpdateHiddenProjectIds();
  const [showHiddenProjects, setShowHiddenProjects] = useState(false);

  const hiddenProjectIdSet = new Set(hiddenProjectIds);
  const visibleProjects = projects.filter(
    (project) => !hiddenProjectIdSet.has(project.id),
  );
  const hiddenProjects = projects.filter((project) =>
    hiddenProjectIdSet.has(project.id),
  );

  function updateHiddenProjects(projectIds: Array<string>) {
    updateHiddenProjectIds(projectIds);
  }

  function hideProject(projectId: string) {
    updateHiddenProjects(
      hiddenProjectIds.includes(projectId)
        ? hiddenProjectIds
        : [...hiddenProjectIds, projectId],
    );
  }

  function showProject(projectId: string) {
    updateHiddenProjects(
      hiddenProjectIds.filter(
        (currentProjectId) => currentProjectId !== projectId,
      ),
    );
  }

  return (
    <div className="flex h-full min-h-0 w-fit shrink-0 flex-col gap-2 overflow-y-auto border-r border-gray-700 p-2">
      <button
        aria-label="Show hidden projects"
        className="flex h-8 w-8 items-center justify-center rounded-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
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

      <HiddenProjectsModal
        hiddenProjects={hiddenProjects}
        onOpenChange={setShowHiddenProjects}
        onShowProject={showProject}
        open={showHiddenProjects}
      />
    </div>
  );
}
