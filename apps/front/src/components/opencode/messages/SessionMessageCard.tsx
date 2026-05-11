import type { SessionMessage } from '#/hooks/queries/opencode/session.queries';
import { cn } from '#/lib/utils';
import { SessionMessagePartsRenderer } from './SessionMessagePartsRenderer';

export function SessionMessageCard({
  messages,
}: {
  messages: SessionMessage[];
}) {
  const isUserMessage = messages[0]?.info.role === 'user';

  return (
    <div
      className={cn('text-sm rounded-sm p-2 flex flex-col gap-2', {
        'bg-blue-500': isUserMessage,
      })}
    >
      <SessionMessagePartsRenderer
        parts={messages.flatMap((message) => message.parts)}
      />
    </div>
  );
}
