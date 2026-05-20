import z from 'zod';
import { KanbanColumn } from '../../generated/prisma/enums';

export const KANBAN_COLUMNS_SCHEMA = z.union([
  z.literal(KanbanColumn.AI),
  z.literal(KanbanColumn.DONE),
  z.literal(KanbanColumn.REVIEW),
  z.literal(KanbanColumn.TODO),
]);
