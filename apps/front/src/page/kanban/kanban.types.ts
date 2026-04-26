import type { KanbanColumn } from '#/hooks/queries/kanban/kanban.queries';

export const KANBAN_COLUMNS = [
  'TODO',
  'AI',
  'REVIEW',
  'DONE',
] as const satisfies readonly KanbanColumn[];

export type Column = (typeof KANBAN_COLUMNS)[number];
