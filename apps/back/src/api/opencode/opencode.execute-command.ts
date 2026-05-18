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
