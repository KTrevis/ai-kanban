import Elysia from 'elysia';
import z from 'zod';
import { fetchNotionAccessToken } from './notion.oauth';

export const NOTION_CONTROLLER = new Elysia({ prefix: 'notion' }).get(
  'oauth/callback',
  async ({ query: { code } }) => {
    const accessToken = await fetchNotionAccessToken(code);

    return { accessToken };
  },
  {
    query: z.object({
      code: z.string().min(1),
    }),
  },
);
