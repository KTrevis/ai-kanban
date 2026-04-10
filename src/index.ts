import { Elysia } from "elysia";
import { VIKUNJA_CONTROLLER } from "./vikunja/vikunja.controller";
import cors from "@elysiajs/cors";

export const app = new Elysia()
  .onAfterResponse(({ request, set }) => {
    console.log(request.method, request.url, set.status);
  })
  .use(cors())
  .use(VIKUNJA_CONTROLLER)
  .listen(420);

console.log("Server started on port", app.server?.port);
