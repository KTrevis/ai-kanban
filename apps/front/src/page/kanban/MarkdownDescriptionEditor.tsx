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
}: {
  initialValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <MDXEditor
      className="kanban-description-editor"
      contentEditableClassName="outline-none"
      markdown={initialValue}
      onChange={onChange}
      plugins={DESCRIPTION_EDITOR_PLUGINS}
      spellCheck={false}
    />
  );
}
