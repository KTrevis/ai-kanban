import { useGetSession } from '#/hooks/queries/opencode/session.queries';
import { SessionMessageCard } from './SessionMessageCard';

export function SessionMessages({ id }: { id: string }) {
  const { data: session } = useGetSession(id);
  const messageGroups = groupConsecutiveAssistantMessages(
    session?.messages ?? [],
  );

  return (
    <div className="flex flex-col overflow-y-auto px-4 py-2">
      {messageGroups.map((curr) => (
        <SessionMessageCard key={curr[0].info.id} messages={curr} />
      ))}
    </div>
  );
}

function groupConsecutiveAssistantMessages<T extends { info: { role: string } }>(
  messages: T[],
) {
  return messages.reduce<T[][]>((groups, message) => {
    const previousGroup = groups.at(-1);
    const shouldMergeWithPrevious =
      message.info.role !== 'user' &&
      previousGroup?.[0]?.info.role !== 'user';

    if (shouldMergeWithPrevious && previousGroup) {
      previousGroup.push(message);
      return groups;
    }

    groups.push([message]);
    return groups;
  }, []);
}
