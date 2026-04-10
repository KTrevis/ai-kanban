import type { TaskUpdatedEvent } from "../../schema/vikunja/task/task.updated.schema";
import {
  createSessionForWorktree,
  getLabelWorktree,
  startTaskPrompt,
} from "./opencode.client";

// TODO: renvoyer des erreurs 400 apres les logs
export async function handleFinalTaskUpdatedEvent(event: TaskUpdatedEvent) {
  const { task } = event.data;
  const bucket = task.buckets?.[0];

  if (!bucket) {
    console.error(`No bucket linked to the card ${task.title}`);
    return;
  }

  if (bucket.title !== "AI") {
    return;
  }

  const label = task.labels[0]?.title;

  if (!label) {
    console.error(
      `A label with the same name than the opencode project of your choice must be linked to the card ${task.title}`,
    );
    return;
  }
  const worktree = await getLabelWorktree(label);

  if (!worktree) {
    console.error(
      `A label was found on the card ${task.title}, but it does not match any opencode projects`,
    );
    return;
  }

  const session = await createSessionForWorktree(
    worktree,
    `Kanban - ${task.title ?? "untitled"}`,
  );

  await startTaskPrompt(session.id, worktree, task);
}
