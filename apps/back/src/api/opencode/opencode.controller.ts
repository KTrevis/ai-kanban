import Elysia from 'elysia';
import { createOpencode } from '@opencode-ai/sdk';
import { getProjectSessions } from './opencode.sessions';

const opencode = await createOpencode();
export const opencodeClient = opencode.client;

export const OPENCODE_CONTROLLER = new Elysia({ prefix: 'opencode' })
  .get('projects', async () => {
    const { data } = await opencodeClient.project.list();
    return data ?? [];
  })
  .get('project/:id', async ({ params: { id } }) => {
    return {
      sessions: await getProjectSessions(id),
    };
  });
