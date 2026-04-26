import type { MessagePart } from '#/hooks/queries/opencode/session.queries';
import MarkdownPreview from '@uiw/react-markdown-preview';

export function SessionMessagePart({ part }: { part: MessagePart }) {
  if (part.type === 'text' && part.synthetic !== true) {
    return (
      <MarkdownPreview
        source={part.text}
        style={{ background: 'transparent', fontSize: 14, color: 'white' }}
      />
    );
  }
  if (part.type === 'reasoning') {
    return <div className="text-gray-400">Thinking...</div>;
  }
  if (part.type === 'tool') {
    return <div className="text-gray-400">Exploring...</div>;
  }
  return null;
}
