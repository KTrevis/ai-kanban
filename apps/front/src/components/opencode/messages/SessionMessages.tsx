import { useGetSession } from '#/hooks/queries/opencode/session.queries';
import { useLayoutEffect, useRef } from 'react';
import { SessionMessageCard } from './SessionMessageCard';
import { groupConsecutiveAssistantMessages } from './session-message.utils';

export function SessionMessages({
  id,
  waitingForResponse = false,
}: {
  id: string;
  waitingForResponse?: boolean;
}) {
  const { data: session } = useGetSession(id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const messages = session?.messages;
  const messageGroups = groupConsecutiveAssistantMessages(messages ?? []);

  useLayoutEffect(() => {
    if (shouldStickToBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [messages]);

  function onScroll() {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const distanceToBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;

    shouldStickToBottomRef.current = distanceToBottom < 80;
  }

  return (
    <div
      className="flex h-full flex-col overflow-y-auto px-4 py-2"
      onScroll={onScroll}
      ref={scrollRef}
    >
      {messageGroups.map((curr) => (
        <SessionMessageCard key={curr[0].info.id} messages={curr} />
      ))}
      {waitingForResponse && (
        <span className="animate-pulse text-sm text-gray-400 p-2">
          Thinking...
        </span>
      )}
      <div ref={bottomRef} className="mt-4" />
    </div>
  );
}
