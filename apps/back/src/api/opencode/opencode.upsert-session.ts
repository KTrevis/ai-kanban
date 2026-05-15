import { opencodeClient } from './opencode.controller';
import { notifyAgentTaskStarted } from '../../lib/notifications';

export async function upsertSessionMessage({
  message,
  projectId,
  sessionId,
  taskTitle,
}: {
  message: string;
  projectId: string;
  sessionId?: string;
  taskTitle?: string;
}) {
  const { data: projects } = await opencodeClient.project.list();
  const project = projects?.find((project) => project.id === projectId);

  if (!project) {
    return { error: 'Project not found' as const, status: 404 as const };
  }

  const sessionExists = sessionId?.length;
  const targetSessionId = sessionExists
    ? sessionId
    : await createSession(project.worktree);

  opencodeClient.session.promptAsync({
    body: {
      parts: [
        {
          text:
            message + (!sessionExists ? `\nSESSION_ID=${targetSessionId}` : ''),
          type: 'text',
        },
      ],
    },
    path: { id: targetSessionId },
    query: { directory: project.worktree },
  });
  notifyAgentTaskStarted(taskTitle);

  return { sessionId: targetSessionId };
}

export async function executeSessionCommand({
  args,
  command,
  projectId,
  sessionId,
}: {
  args?: string;
  command: string;
  projectId: string;
  sessionId?: string;
}) {
  const { data: projects } = await opencodeClient.project.list();
  const project = projects?.find((project) => project.id === projectId);

  if (!project) {
    return { error: 'Project not found' as const, status: 404 as const };
  }

  const targetSessionId = sessionId?.length
    ? sessionId
    : await createSession(project.worktree);

  await opencodeClient.session.command({
    body: {
      arguments: args ?? '',
      command,
    },
    path: { id: targetSessionId },
    query: { directory: project.worktree },
  });

  return { sessionId: targetSessionId };
}

async function createSession(directory: string) {
  const { data: session } = await opencodeClient.session.create({
    query: { directory },
  });

  if (!session) {
    throw new Error('Failed to create session');
  }

  return session.id;
}
