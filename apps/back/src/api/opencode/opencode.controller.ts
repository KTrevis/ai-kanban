import Elysia, { t } from 'elysia';
import { createOpencode } from '@opencode-ai/sdk';
import { getProjectSessions } from './opencode.sessions';
import { upsertSessionMessage } from './opencode.upsert-session';
import { websockets } from '../ws/ws.controller';

const opencode = await createOpencode();
export const opencodeClient = opencode.client;

void (async () => {
  const subscription = await opencodeClient.global.event();

  for await (const event of subscription.stream) {
    if (event.payload.type !== 'message.part.updated') {
      continue;
    }
    const { part } = event.payload.properties;
    if (part.type !== 'text') {
      continue;
    }
    const role = part.metadata !== undefined ? 'assistant' : 'user';
    if (role === 'user' || part.text.trim() === '') {
      continue;
    }
    websockets.sendMessage({
      type: 'message.part.updated',
      text: part.text,
      sessionId: part.sessionID,
    });
  }
})();

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
      body: t.Object({
        message: t.String(),
        projectId: t.String(),
        sessionId: t.Optional(t.String()),
      }),
    },
  );
