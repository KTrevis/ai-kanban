import { ProjectList } from '#/components/opencode/ProjectList';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/project/')({
  component: ProjectList,
});
