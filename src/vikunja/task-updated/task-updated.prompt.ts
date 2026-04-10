import type { TaskUpdatedEvent } from "../../schema/vikunja/task/task.updated.schema";

type TaskPayload = TaskUpdatedEvent["data"]["task"];

export function buildTaskExecutionPrompt(task: TaskPayload) {
  const title = task.title?.trim() || "Sans titre";
  const description = task.description?.trim() || "Aucune description.";

  return [
    "Ton but est de realiser la tâche suivante.",
    "Quand tu as fini la tâche, utilise le MCP todo list pour la déplacer dans la colonne review.",
    "",
    `Titre de la tâche : ${title}`,
    "Description de la tâche :",
    "```",
    description,
    "```",
  ].join("\n");
}
