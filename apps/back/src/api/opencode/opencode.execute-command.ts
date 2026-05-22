import { HttpError } from '../../lib/http-error';
import { getProjectById } from '../projects/projects.service';
import { opencodeClient } from './opencode.controller';

export const STOP_SESSION_COMMAND = 'stop';

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
  const project = await getProjectById(projectId);

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  if (command === 'undo') {
    if (!sessionId?.length) {
      throw new HttpError(400, 'Session is required to undo');
    }

    return await revertLastSessionMessage({
      directory: project.worktree,
      sessionId,
    });
  }

  if (command === STOP_SESSION_COMMAND) {
    if (!sessionId?.length) {
      return { error: 'Session not found' as const, status: 404 as const };
    }

    await opencodeClient.session.abort({
      path: { id: sessionId },
      query: { directory: project.worktree },
    });

    return { sessionId };
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

async function revertLastSessionMessage({
  directory,
  sessionId,
}: {
  directory: string;
  sessionId: string;
}) {
  const { data: messages = [] } = await opencodeClient.session.messages({
    path: { id: sessionId },
    query: { directory },
  });
  const lastMessage = messages.at(-1);

  if (!lastMessage) {
    throw new HttpError(400, 'No message to undo');
  }

  await opencodeClient.session.revert({
    body: { messageID: lastMessage.info.id },
    path: { id: sessionId },
    query: { directory },
  });

  return { sessionId };
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
