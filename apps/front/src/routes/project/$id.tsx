import { ProjectPage } from '#/page/opencode/project/ProjectPage';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod/v3';

export const Route = createFileRoute('/project/$id')({
  component: RouteComponent,
  validateSearch: z.object({
    sessionId: z.string().optional(),
  }),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { sessionId } = Route.useSearch();
  return <ProjectPage projectId={id} sessionId={sessionId} />;
}
