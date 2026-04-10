import type { VikunjaWebhookEvent } from "../schema/vikunja/vikunja.schema";
import { TaskUpdatedDebouncer } from "./task-updated/task-updated.debouncer";
import { handleFinalTaskUpdatedEvent } from "./task-updated/task-updated.handler";

const taskUpdatedDebouncer = new TaskUpdatedDebouncer(
  handleFinalTaskUpdatedEvent,
  400,
);

export function dispatchVikunjaWebhook(event: VikunjaWebhookEvent): void {
  if (event.event_name === "task.updated") {
    taskUpdatedDebouncer.enqueue(event);
  }
}
