import type { MessagePart } from '#/hooks/queries/opencode/session.queries';
import { cn } from '#/lib/utils';
import MarkdownPreview from '@uiw/react-markdown-preview';

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
      <MarkdownPreview
        source={part.text}
        style={{ background: 'transparent', fontSize: 14, color: 'white' }}
      />
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
