import { getProjectById } from '../projects/projects.service';
import { opencodeClient } from './opencode.controller';

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
    return { error: 'Project not found' as const, status: 404 as const };
  }

  if (command === 'undo') {
    if (!sessionId?.length) {
      return { error: 'Session is required to undo' as const, status: 400 as const };
    }

    return await revertLastSessionMessage({
      directory: project.worktree,
      sessionId,
    });
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
    return { error: 'No message to undo' as const, status: 400 as const };
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
