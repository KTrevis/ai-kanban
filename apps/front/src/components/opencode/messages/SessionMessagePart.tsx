import type { MessagePart } from '#/hooks/queries/opencode/session.queries';
import MarkdownPreview from '@uiw/react-markdown-preview';

export function SessionMessagePart({
  count = 1,
  part,
}: {
  count?: number;
  part: MessagePart;
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
      <div className="text-gray-400">Thinking... {formatCount(count)}</div>
    );
  }
  if (part.type === 'tool') {
    if (part.state.status === 'error') {
      return (
        <div className="text-red-500">
          Tool call failed{formatCount(count)}: {part.tool} - {part.state.error}
        </div>
      );
    }
    return (
      <div className="text-gray-400">
        Tool call: {part.tool} {formatCount(count)}
      </div>
    );
  }
  return null;
}

function formatCount(count: number) {
  return count > 1 ? ` ${count}x` : '';
}
