import type { SessionMessage } from '#/hooks/queries/opencode/session.queries';
import { cn } from '#/lib/utils';
import { SessionMessagePart } from './SessionMessagePart';

export function SessionMessageCard({ message }: { message: SessionMessage }) {
  return (
    <div
      className={cn('text-sm rounded-sm p-2 flex flex-col gap-2', {
        'bg-blue-500': message.info.role === 'user',
      })}
    >
      {message.parts.map((curr) => (
        <SessionMessagePart key={curr.id} part={curr} />
      ))}
    </div>
  );
}
