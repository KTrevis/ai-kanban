import type { Project } from '#/hooks/queries/opencode/project.queries';
import { cn } from '#/lib/utils';
import { Link, useNavigate } from '@tanstack/react-router';

export function ProjectCard({
  project,
  selectedProject,
}: {
  project: Project;
  selectedProject?: string;
}) {
  const firstChar = getFirstGrapheme(project.name ?? '');

  if (!firstChar) {
    return null;
  }

  return (
    <Link
      to="/project/$id"
      params={{ id: project.id }}
      className={cn(
        'w-fit cursor-pointer rounded-sm border border-gray-700 px-2 py-1',
        {
          'bg-blue-500': selectedProject === project.id,
        },
      )}
    >
      {firstChar}
    </Link>
  );
}

function getFirstGrapheme(value: string) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return segmenter.segment(value)[Symbol.iterator]().next().value?.segment;
}
