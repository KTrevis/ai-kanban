import type { MessagePart } from '#/hooks/queries/opencode/session.queries';
import { cn } from '#/lib/utils';
import { format } from 'date-fns';
import rehypeHighlight from 'rehype-highlight';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

const markdownComponents: Components = {
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-white/30 pl-3 text-gray-300">
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const code = String(children);
    const isBlock = Boolean(className) || code.includes('\n');

    return (
      <code
        {...props}
        className={cn(
          'rounded bg-white/10 font-mono text-[0.85em] text-gray-100',
          isBlock ? 'block p-3' : 'px-1 py-0.5',
          className,
        )}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }) => <h1 className="text-lg font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="font-semibold">{children}</h3>,
  hr: () => <hr className="border-white/20" />,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5">{children}</ol>
  ),
  p: ({ children }) => <p>{children}</p>,
  pre: ({ children }) => (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-black/30">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  td: ({ children }) => (
    <td className="border border-white/20 px-2 py-1 align-top">{children}</td>
  ),
  th: ({ children }) => (
    <th className="border border-white/20 px-2 py-1 font-semibold">
      {children}
    </th>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5">{children}</ul>
  ),
};

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
        <div className="wrap-break-word space-y-2 text-sm text-white">
          <ReactMarkdown
            components={markdownComponents}
            rehypePlugins={[rehypeHighlight]}
            remarkPlugins={[remarkGfm, remarkBreaks]}
          >
            {part.text}
          </ReactMarkdown>
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
