import notifier from "node-notifier";
import axios from "axios";
import { ENVIRONMENT } from "../../schema/env.schema";

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

export async function buildLaunchTaskPrompt(sessionId: string) {
  const prompt = "TODO";
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
  const title = "TODO";
  notifier.notify({
    title: "🔨 Travaille started",
    message: title,
    sound: true,
    wait: false,
  });
  await buildLaunchTaskPrompt(await getSessionId(worktree, title, sessionId));
  notifier.notify({
    title: "✅ Travaille done",
    message: title ? title : undefined,
    sound: true,
    wait: false,
  });
}
