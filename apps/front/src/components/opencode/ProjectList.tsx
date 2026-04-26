import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import { ProjectCard } from './ProjectCard';

export function ProjectList({ selectedProject }: { selectedProject?: string }) {
  const { data: projects = [] } = useGetProjects();

  return (
    <div className="flex h-full min-h-0 w-fit shrink-0 flex-col gap-2 overflow-y-auto border-r border-gray-700 p-2">
      {projects.map((curr, i) => (
        <div key={curr.id} className="relative">
          <span className="absolute left-0 top-0 z-10 flex size-5 -translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white border border-gray-700">
            {i + 1}
          </span>
          <ProjectCard project={curr} selectedProject={selectedProject} />
        </div>
      ))}
    </div>
  );
}
