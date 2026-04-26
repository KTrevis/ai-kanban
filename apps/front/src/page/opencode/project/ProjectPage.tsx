import { ProjectList } from '#/components/opencode/ProjectList';
import { SessionList } from '#/components/opencode/SessionList';
import { useGetProjectById } from '#/hooks/queries/opencode/project.queries';

export function ProjectPage({ projectId }: { projectId: string }) {
  const { data } = useGetProjectById(projectId);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full min-h-0">
      <ProjectList />
      <SessionList sessions={data.sessions} />
    </div>
  );
}
