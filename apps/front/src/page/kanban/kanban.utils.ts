import { KANBAN_COLUMNS } from './kanban.types';
import type { Column } from './kanban.types';

export function isColumn(value: string): value is Column {
  return KANBAN_COLUMNS.includes(value as Column);
}
