import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { NOTION_CONTROLLER } from "./api/notion/notion.controller";
import { FORGEJO_CONTROLLER } from "./api/forgejo/forgejo.controller";

export const app = new Elysia()
  .onAfterResponse(({ request, set }) => {
    console.log(request.method, request.url, set.status);
  })
  .onError(({ error }) => console.error(error))
  .use(cors())
  .use(NOTION_CONTROLLER)
  .use(FORGEJO_CONTROLLER)
  .listen(420);

console.log("Server started on port", app.server?.port);
console.log(
  "Notion Authorization URL",
  "https://api.notion.com/v1/oauth/authorize?client_id=33ed872b-594c-815f-800b-0037c0602865&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fb5e3-46-193-67-57.ngrok-free.app%2Fnotion%2Foauth",
);
