import Elysia from "elysia";
import z from "zod";
import { fetchAccessToken } from "./notion.oauth";
import { getPageDescription, getPageTitle } from "./get-page-description";
import {
  getProjectFolderByName,
  launchNewTask,
} from "../../lib/opencode/opencode.client";

export const NOTION_CONTROLLER = new Elysia({ prefix: "notion" })
  .post(
    "webhook",
    async ({ body: { data } }) => {
      const project = data.properties["Projet"].select.name;
      const sessionId =
        data.properties.Session.rich_text
          ?.map((item) => item.plain_text)
          .join("")
          .trim() || undefined;
      const folder = await getProjectFolderByName(project);

      if (!folder) {
        console.error(`Failed to find folder for project ${project}`);
        return;
      }

      await launchNewTask(folder, data.id, sessionId);
    },
    {
      body: z.object({
        data: z.object({
          id: z.string(),
          properties: z.object({
            Projet: z.object({
              select: z.object({
                name: z.string(),
              }),
            }),
            Session: z.object({
              rich_text: z
                .array(
                  z.object({
                    plain_text: z.string(),
                  }),
                )
                .optional(),
            }),
          }),
        }),
      }),
    },
  )
  .get(
    "oauth",
    async ({ query: { code } }) => {
      const accessToken = await fetchAccessToken(code);
      return accessToken;
    },
    {
      query: z.object({
        code: z.string(),
      }),
    },
  );
