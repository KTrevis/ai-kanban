import z from "zod";

const ENV_SCHEMA = z.object({
  OPENCODE_URL: z.string(),
});

export const ENVIRONMENT = ENV_SCHEMA.parse(process.env);
