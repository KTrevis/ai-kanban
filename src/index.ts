import { Elysia } from "elysia";
import cors from "@elysiajs/cors";

export const app = new Elysia()
  .onAfterResponse(({ request, set }) => {
    console.log(request.method, request.url, set.status);
  })
  .onError(({ error }) => console.error(error))
  .use(cors())
  .listen(420);

console.log("Server started on port", app.server?.port);
