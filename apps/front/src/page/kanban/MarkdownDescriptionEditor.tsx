import {
  codeBlockPlugin,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
} from '@mdxeditor/editor';
import type { KeyboardEvent } from 'react';

const DESCRIPTION_EDITOR_PLUGINS = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  linkPlugin(),
  codeBlockPlugin(),
  markdownShortcutPlugin(),
];

export function MarkdownDescriptionEditor({
  initialValue,
  onChange,
  onSubmit,
}: {
  initialValue: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}) {
  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) {
      return;
    }

    event.preventDefault();
    onSubmit?.();
  };

  return (
    <div onKeyDownCapture={handleKeyDownCapture}>
      <MDXEditor
        className="kanban-description-editor"
        contentEditableClassName="outline-none"
        markdown={initialValue}
        onChange={onChange}
        plugins={DESCRIPTION_EDITOR_PLUGINS}
        spellCheck={false}
      />
    </div>
  );
}
