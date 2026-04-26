export const KANBAN_COLUMNS = ['TODO', 'AI', 'Review', 'Done'] as const;

export type Column = (typeof KANBAN_COLUMNS)[number];

export type Card = {
  id: string;
  title: string;
  description: string;
  column: Column;
};
