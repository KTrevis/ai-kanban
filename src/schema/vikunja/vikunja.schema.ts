import { z } from "zod";
import { TASK_UPDATED_SCHEMA } from "./task/task.updated.schema";

export const VIKUNJA_WEBHOOK_SCHEMA = z.discriminatedUnion("event_name", [
  TASK_UPDATED_SCHEMA,
]);

export type VikunjaWebhookEvent = z.infer<typeof VIKUNJA_WEBHOOK_SCHEMA>;
