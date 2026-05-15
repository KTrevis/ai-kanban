import { ReviewPage } from '#/page/opencode/project/ReviewPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/review/$cardId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { cardId } = Route.useParams();

  return <ReviewPage cardId={cardId} />;
}
