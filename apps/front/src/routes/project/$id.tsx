import { ProjectPage } from '#/page/opencode/project/ProjectPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/project/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <ProjectPage projectId={id} />;
}
