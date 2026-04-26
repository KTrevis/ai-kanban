import { useGetSession } from '#/hooks/queries/opencode/session.queries';
import { SessionMessageCard } from './SessionMessageCard';

export function SessionMessages({ id }: { id: string }) {
  const { data: session } = useGetSession(id);
  return (
    <div className="flex flex-col overflow-y-auto px-4">
      {session?.messages?.map((curr) => (
        <SessionMessageCard key={curr.info.id} message={curr} />
      ))}
    </div>
  );
}
