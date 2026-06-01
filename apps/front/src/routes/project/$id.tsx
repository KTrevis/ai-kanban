import { ProjectPage } from '#/page/opencode/project/ProjectPage';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod/v3';

export const Route = createFileRoute('/project/$id')({
  component: RouteComponent,
  validateSearch: z.object({
    cardId: z.string().optional(),
  }),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { cardId } = Route.useSearch();
  const navigate = Route.useNavigate();

  function setCardId(nextCardId?: string) {
    navigate({
      search: (search) => ({ ...search, cardId: nextCardId }),
      replace: true,
    });
  }

  return (
    <ProjectPage
      cardId={cardId}
      projectId={id}
      onCardIdChange={setCardId}
    />
  );
}
