import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { OPENCODE_CONTROLLER } from './api/opencode/opencode.controller';
import { startOpencodeEventRelay } from './api/opencode/opencode.event-relay';
import { WS_CONTROLLER } from './api/ws/ws.controller';
import { KANBAN_CONTROLLER } from './api/kanban/kanban.controller';

export const app = new Elysia()
  .onAfterResponse(({ request, set }) => {
    console.log(request.method, request.url, set.status);
  })
  .onError(({ error }) => console.error(error))
  .use(cors())
  .use(OPENCODE_CONTROLLER)
  .use(WS_CONTROLLER)
  .use(KANBAN_CONTROLLER);

startOpencodeEventRelay();
