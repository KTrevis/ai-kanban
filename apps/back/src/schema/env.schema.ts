import z from 'zod';

const ENV_SCHEMA = z.object({
  OPENCODE_URL: z.string(),
  NOTION_CLIENT_ID: z.string().optional(),
  NOTION_CLIENT_SECRET: z.string().optional(),
  NOTION_REDIRECT_URI: z.string().optional(),
});

export const ENVIRONMENT = ENV_SCHEMA.parse(process.env);
