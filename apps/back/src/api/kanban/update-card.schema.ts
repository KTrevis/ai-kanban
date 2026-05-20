import z from 'zod';
import { KANBAN_COLUMNS_SCHEMA } from './kanban-columns.schema';

export const UPDATE_KANBAN_CARD_SCHEMA = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  column: KANBAN_COLUMNS_SCHEMA.optional(),
  position: z.number().int().optional(),
  sessionId: z.string().nullable().optional(),
  baseBranch: z.string().optional(),
  newBranch: z.string().optional(),
  useTravailleMcp: z.boolean().optional(),
});

export type UpdateKanbanCard = z.infer<typeof UPDATE_KANBAN_CARD_SCHEMA>;
