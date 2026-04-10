import Elysia from "elysia";
import { dispatchVikunjaWebhook } from "./vikunja-webhook.dispatcher";
import { VIKUNJA_WEBHOOK_SCHEMA } from "../schema/vikunja/vikunja.schema";

export const VIKUNJA_CONTROLLER = new Elysia({ prefix: "vikunja" }).post(
  "webhook",
  ({ body }) => {
    dispatchVikunjaWebhook(body);
    return { ok: true };
  },
  {
    body: VIKUNJA_WEBHOOK_SCHEMA,
  },
);
