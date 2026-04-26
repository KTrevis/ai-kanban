import { ProjectList } from '#/components/opencode/ProjectList';
import { SessionList } from '#/components/opencode/SessionList';
import { SessionMessages } from '#/components/opencode/messages/SessionMessages';
import { useGetProjectById } from '#/hooks/queries/opencode/project.queries';
import { useNavigate } from '@tanstack/react-router';

export function ProjectPage({
  projectId,
  sessionId,
}: {
  projectId: string;
  sessionId?: string;
}) {
  const { data } = useGetProjectById(projectId);
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0">
      <ProjectList />
      {data && (
        <SessionList
          sessions={data.sessions}
          onSessionClick={(session) =>
            navigate({
              to: '/project/$id',
              params: { id: projectId },
              search: { sessionId: session.id },
            })
          }
        />
      )}
      {sessionId && <SessionMessages id={sessionId} />}
    </div>
  );
}
