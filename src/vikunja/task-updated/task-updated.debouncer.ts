import debounce from "lodash.debounce";
import type { TaskUpdatedEvent } from "../../schema/vikunja/task/task.updated.schema";

type TaskUpdatedHandler =
  | ((event: TaskUpdatedEvent) => void)
  | ((event: TaskUpdatedEvent) => Promise<void>);

export class TaskUpdatedDebouncer {
  private readonly latestByTaskId = new Map<number, TaskUpdatedEvent>();
  private readonly flushersByTaskId = new Map<
    number,
    ReturnType<typeof debounce>
  >();

  constructor(
    private readonly handler: TaskUpdatedHandler,
    private readonly waitMs = 400,
  ) {}

  public enqueue(event: TaskUpdatedEvent): void {
    const taskId = event.data.task.id;

    this.latestByTaskId.set(taskId, event);

    let flusher = this.flushersByTaskId.get(taskId);

    if (!flusher) {
      flusher = debounce(() => {
        void this.flush(taskId);
      }, this.waitMs);
      this.flushersByTaskId.set(taskId, flusher);
    }

    flusher();
  }

  private async flush(taskId: number): Promise<void> {
    const event = this.latestByTaskId.get(taskId);
    this.latestByTaskId.delete(taskId);

    const flusher = this.flushersByTaskId.get(taskId);
    flusher?.cancel();
    this.flushersByTaskId.delete(taskId);

    if (!event) {
      return;
    }

    await this.handler(event);
  }
}
