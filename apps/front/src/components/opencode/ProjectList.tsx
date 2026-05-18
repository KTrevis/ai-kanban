import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectCard } from './ProjectCard';

export function ProjectList({ selectedProject }: { selectedProject?: string }) {
  const { data: projects = [] } = useGetProjects();
  const [showCreateProject, setShowCreateProject] = useState(false);

  return (
    <div className="flex h-full min-h-0 w-fit shrink-0 flex-col gap-2 overflow-y-auto border-r border-gray-700 p-2">
      <button
        aria-label="Create project"
        className="flex size-8 cursor-pointer items-center justify-center rounded-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        onClick={() => setShowCreateProject(true)}
        type="button"
      >
        <Plus size={16} />
      </button>

      {projects.map((curr) => (
        <ProjectCard
          key={curr.id}
          project={curr}
          selectedProject={selectedProject}
        />
      ))}

      <CreateProjectModal
        onOpenChange={setShowCreateProject}
        open={showCreateProject}
      />
    </div>
  );
}
