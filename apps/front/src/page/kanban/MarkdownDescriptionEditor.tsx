import {
  codeBlockPlugin,
  codeMirrorPlugin,
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
  codeBlockPlugin({ defaultCodeBlockLanguage: 'ts' }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      bash: 'Bash',
      css: 'CSS',
      js: 'JavaScript',
      json: 'JSON',
      md: 'Markdown',
      sql: 'SQL',
      ts: 'TypeScript',
      tsx: 'TypeScript React',
      txt: 'Plain text',
    },
  }),
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
