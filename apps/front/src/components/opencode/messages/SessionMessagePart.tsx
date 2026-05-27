import type { MessagePart } from '#/hooks/queries/opencode/session.queries';
import { cn } from '#/lib/utils';
import { format } from 'date-fns';

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
    const date = new Date(part.time?.start ?? '');
    return (
      <div>
        <div className="text-xs text-gray-500">
          {!isNaN(date.getTime()) && format(date, 'dd/LL/yyyy hh:mm:ss')}
        </div>
        <div className="whitespace-pre-wrap wrap-break-word text-sm text-white">
          {part.text}
        </div>
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
