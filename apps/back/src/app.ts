import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { OPENCODE_CONTROLLER } from './api/opencode/opencode.controller';

export const app = new Elysia()
  .onAfterResponse(({ request, set }) => {
    console.log(request.method, request.url, set.status);
  })
  .onError(({ error }) => console.error(error))
  .use(cors())
  .use(OPENCODE_CONTROLLER);
