import { getProjectById } from './opencode.projects';
import { opencodeClient } from './opencode.controller';

export async function getProjectSessions(projectId: string) {
  const project = await getProjectById(projectId);

  if (!project) {
    return null;
  }

  const { data: sessions } = await opencodeClient.session.list({
    query: {
      directory: project.worktree,
    },
  });

  const filteredSessions =
    sessions?.filter((session) => {
      return session.projectID === projectId && !('archived' in session.time);
    }) ?? [];
  return filteredSessions;
}
