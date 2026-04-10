import z from "zod";

export const VIKUNJA_BUCKET = z.object({
  id: z.number(),
  title: z.string(),
});
