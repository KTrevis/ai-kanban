import type { Session } from '#/hooks/queries/opencode/project.queries';

export function SessionList({ sessions }: { sessions: Session[] | null }) {
  if (!sessions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-y-auto max-w-40 border-r border-gray-700">
      {sessions.map((curr) => (
        <div
          key={curr.id}
          className="truncate text-sm mx-2 my-1 cursor-pointer"
        >
          {curr.title}
        </div>
      ))}
    </div>
  );
}
