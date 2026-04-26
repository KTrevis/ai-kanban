import notifier from "node-notifier";
import axios from "axios";
import { buildTaskExecutionPrompt } from "../../api/notion/task-updated.prompt";
import { ENVIRONMENT } from "../../config/env";
import {
  getPageDescription,
  getPageTitle,
} from "../../api/notion/get-page-description";

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
    `${ENVIRONMENT.OPENCODE_URL}/project`,
  );
  return data.filter((curr) => curr.name !== undefined);
}

export async function getProjectFolderByName(label: string) {
  const projects = await fetchOpencodeProjects();
  return projects.find((curr) => curr.name === label)?.worktree;
}

async function createSessionForWorktree(worktree: string, title: string) {
  const { data } = await axios.post<OpencodeSession>(
    `${ENVIRONMENT.OPENCODE_URL}/session`,
    { title },
    {
      params: {
        directory: worktree,
      },
    },
  );

  return data;
}

export async function buildLaunchTaskPrompt(
  sessionId: string,
  title: string,
  description: string,
  pageId: string,
) {
  const prompt = await buildTaskExecutionPrompt(
    title,
    description,
    pageId,
    sessionId,
  );
  await startTask(prompt, sessionId);
}

export async function startTask(prompt: string, sessionId: string) {
  await axios.post(`${ENVIRONMENT.OPENCODE_URL}/session/${sessionId}/message`, {
    parts: [
      {
        type: "text",
        text: prompt,
      },
    ],
  });
}

async function getSessionId(
  worktree: string,
  title?: string | null,
  sessionId?: string,
) {
  if (sessionId) {
    return sessionId;
  }
  const session = await createSessionForWorktree(
    worktree,
    `KANBAN - ${title ?? "untitled"}`,
  );
  return session.id;
}

export async function launchNewTask(
  worktree: string,
  pageId: string,
  sessionId?: string,
) {
  const description = await getPageDescription(pageId);
  const title = await getPageTitle(pageId);
  notifier.notify({
    title: "🔨 Travaille started",
    message: title ? title : undefined,
    sound: true,
    wait: false,
  });
  await buildLaunchTaskPrompt(
    await getSessionId(worktree, title, sessionId),
    title ?? "",
    description ?? "",
    pageId,
  );
  notifier.notify({
    title: "✅ Travaille done",
    message: title ? title : undefined,
    sound: true,
    wait: false,
  });
}
