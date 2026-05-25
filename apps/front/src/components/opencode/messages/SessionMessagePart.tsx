import type { MessagePart } from '#/hooks/queries/opencode/session.queries';
import { cn } from '#/lib/utils';

export function SessionMessagePart({
  count = 1,
  part,
  pulse,
}: {
  count?: number;
  part: MessagePart;
  pulse: boolean;
}) {
  if (part.type === 'text' && part.synthetic !== true) {
    return (
      <div className="whitespace-pre-wrap break-words text-sm text-white [overflow-wrap:anywhere]">
        {part.text}
      </div>
    );
  }
  if (part.type === 'reasoning') {
    return (
      <div
        className={cn('text-gray-400', {
          'animate-pulse': pulse,
        })}
      >
        Thinking... {formatCount(count)}
      </div>
    );
  }
  if (part.type === 'tool') {
    if (part.state.status === 'error') {
      return (
        <div
          className={cn('text-red-500', {
            'animate-pulse': pulse,
          })}
        >
          Tool call failed{formatCount(count)}: {part.tool} - {part.state.error}
        </div>
      );
    }
    return (
      <div
        className={cn('text-gray-400', {
          'animate-pulse': pulse,
        })}
      >
        Tool call: {part.tool} {formatCount(count)}
      </div>
    );
  }
  return null;
}

function formatCount(count: number) {
  return count > 1 ? ` ${count}x` : '';
}
