import axios from "axios";
import type { TaskUpdatedEvent } from "../../schema/vikunja/task/task.updated.schema";
import { OPENCODE_URL } from "../../config/opencode.config";
import { buildTaskExecutionPrompt } from "./task-updated.prompt";

type TaskPayload = TaskUpdatedEvent["data"]["task"];

type OpencodeProject = {
  name?: string;
  worktree: string;
};

type OpencodeSession = {
  id: string;
  directory: string;
};

async function fetchOpencodeProjects() {
  const { data } = await axios.get<OpencodeProject[]>(
    `${OPENCODE_URL}/project`,
  );
  return data.filter((curr) => curr.name !== undefined);
}

export async function getLabelWorktree(label: string) {
  const projects = await fetchOpencodeProjects();
  console.log(projects.map((curr) => curr.name));
  return projects.find((curr) => curr.name === label)?.worktree;
}

export async function createSessionForWorktree(
  worktree: string,
  title: string,
) {
  const { data } = await axios.post<OpencodeSession>(
    `${OPENCODE_URL}/session`,
    { title },
    {
      params: {
        directory: worktree,
      },
    },
  );

  return data;
}

export async function startTaskPrompt(
  sessionId: string,
  worktree: string,
  task: TaskPayload,
) {
  const prompt = buildTaskExecutionPrompt(task);

  await axios.post(
    `${OPENCODE_URL}/session/${sessionId}/prompt_async`,
    {
      parts: [
        {
          type: "text",
          text: prompt,
        },
      ],
    },
    {
      params: {
        directory: worktree,
      },
    },
  );
}
