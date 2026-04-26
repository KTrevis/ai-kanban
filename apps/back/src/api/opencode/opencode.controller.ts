import Elysia, { t } from 'elysia';
import { createOpencode } from '@opencode-ai/sdk';
import { getProjectSessions } from './opencode.sessions';
import { upsertSessionMessage } from './opencode.upsert-session';
import z from 'zod/v3';

const opencode = await createOpencode();
export const opencodeClient = opencode.client;

export const OPENCODE_CONTROLLER = new Elysia({ prefix: 'opencode' })
  .get('projects', async () => {
    const { data = [] } = await opencodeClient.project.list();
    return data.filter((curr) => curr.id !== 'global');
  })
  .get('project/:id', async ({ params: { id } }) => {
    return {
      sessions: await getProjectSessions(id),
    };
  })
  .get('session/:id', async ({ params: { id } }) => {
    const { data: messages } = await opencodeClient.session.messages({
      path: { id },
    });
    return { messages };
  })
  .post(
    'session/message',
    async ({ body: { message, projectId, sessionId } }) => {
      const result = await upsertSessionMessage({
        message,
        projectId,
        sessionId,
      });

      return { sessionId: result.sessionId };
    },
    {
      body: z.object({
        message: z.string(),
        projectId: z.string(),
        sessionId: z.optional(z.string()),
      }),
    },
  );
