import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import { ProjectCard } from './ProjectCard';

export function ProjectList() {
  const { data: projects = [] } = useGetProjects();

  return (
    <div className="flex h-full min-h-0 w-fit shrink-0 flex-col gap-2 overflow-y-auto border-r border-gray-700 p-2">
      {projects.map((curr) => (
        <ProjectCard key={curr.id} project={curr} />
      ))}
    </div>
  );
}
