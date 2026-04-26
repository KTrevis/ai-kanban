import Elysia from "elysia";
import z from "zod";
import { extractSessionId } from "./extract-session-id";
import { startTask } from "../../lib/opencode/opencode.client";
import nodeNotifier from "node-notifier";

function buildCommentWebhookPrompt(prUrl: string, comment: string) {
  return [
    "Nouveau commentaire Forgejo recu sur ta PR.",
    "",
    `PR: ${prUrl}`,
    "Commentaire:",
    "```",
    comment,
    "```",
    "",
    "Consignes obligatoires:",
    "- N'effectue aucune modification locale: ne modifie jamais le code local.",
    "- Si des changements sont necessaires, modifie uniquement la PR existante.",
    "- Reponds obligatoirement au commentaire Forgejo par un nouveau commentaire sur la PR.",
    "- La toute premiere ligne de tous tes commentaires doivent etre exactement: [OPENCODE]",
    "- Contenu de la reponse (court): soit un bref resume des changements, soit une reponse a la question, soit une question de clarification.",
  ].join("\n");
}

function isOpencodeComment(comment: string) {
  const split = comment.split("\n");
  if (!split.length) {
    return false;
  }
  return split[0] === "[OPENCODE]";
}

export const FORGEJO_CONTROLLER = new Elysia({ prefix: "forgejo" }).post(
  "",
  async ({ body, set }) => {
    if (isOpencodeComment(body.comment.body)) {
      return;
    }
    const sessionId = extractSessionId(body.pull_request.body.split("\n"));

    if (!sessionId) {
      set.status = "Bad Request";
      return {
        error: "Missing OPENCODE_SESSION_ID in pull request body",
      };
    }

    const prompt = buildCommentWebhookPrompt(
      body.pull_request.url,
      body.comment.body,
    );

    nodeNotifier.notify({
      title: "🔨 Travaille answering PR comment",
      message: `PR: ${body.pull_request.url}`,
    });
    await startTask(prompt, sessionId);
    nodeNotifier.notify({
      title: "✅ Travaille answered PR comment",
      message: `PR: ${body.pull_request.url}`,
    });

    return { ok: true };
  },
  {
    body: z.object({
      comment: z.object({
        body: z.string(),
      }),
      pull_request: z.object({
        url: z.string(),
        body: z.string(),
      }),
    }),
  },
);
