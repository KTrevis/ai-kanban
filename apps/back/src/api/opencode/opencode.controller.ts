import Elysia from 'elysia';
import {
  createOpencode,
  createOpencodeClient,
  type OpencodeClient,
} from '@opencode-ai/sdk';
import { ENVIRONMENT } from '../../schema/env.schema';
import { executeSessionCommand } from './opencode.execute-command';
import { getProjectSessions } from './opencode.sessions';
import { upsertSessionMessage } from './opencode.upsert-session';
import z from 'zod/v3';

async function canReachOpencode(url: string) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1_000) });
    return true;
  } catch {
    return false;
  }
}

async function createClient(): Promise<OpencodeClient> {
  if (await canReachOpencode(ENVIRONMENT.OPENCODE_URL)) {
    return createOpencodeClient({ baseUrl: ENVIRONMENT.OPENCODE_URL });
  }

  const url = new URL(ENVIRONMENT.OPENCODE_URL);
  const opencode = await createOpencode({
    hostname: url.hostname,
    port: url.port ? Number(url.port) : undefined,
  });

  return opencode.client;
}

export const opencodeClient = await createClient();

export const OPENCODE_CONTROLLER = new Elysia({ prefix: 'opencode' })
  .get('projects', async () => {
    const { data = [] } = await opencodeClient.project.list();
    return data.filter((curr) => curr.id !== 'global');
  })
  .get('project/:id/commands', async ({ params: { id } }) => {
    const { data: projects = [] } = await opencodeClient.project.list();
    const project = projects.find((curr) => curr.id === id);
    const { data: commands = [] } = await opencodeClient.command.list({
      query: { directory: project?.worktree },
    });

    return { commands };
  })
  .get(
    'project/:id/files',
    async ({ params: { id }, query: { q } }) => {
      const { data: projects = [] } = await opencodeClient.project.list();
      const project = projects.find((curr) => curr.id === id);

      if (!project) {
        return { files: [] };
      }

      const process = Bun.spawn(
        [
          'git',
          '-C',
          project.worktree,
          'ls-files',
          '-co',
          '--exclude-standard',
        ],
        { stdout: 'pipe' },
      );
      const output = await new Response(process.stdout).text();
      const exitCode = await process.exited;

      if (exitCode !== 0) {
        return { files: [] };
      }

      const search = q.toLowerCase();

      return {
        files: output
          .split('\n')
          .filter(Boolean)
          .filter((file) => file.toLowerCase().includes(search))
          .slice(0, 50),
      };
    },
    {
      query: z.object({
        q: z.string().default(''),
      }),
    },
  )
  .get('project/:id', async ({ params: { id } }) => {
    return {
      sessions: await getProjectSessions(id),
    };
  })
  .get('session/:id', async ({ params: { id } }) => {
    const { data: messages } = await opencodeClient.session.messages({
      path: { id },
    });
    return { messages };
  })
  .post(
    'session/message',
    async ({ body: { message, projectId, sessionId, taskTitle } }) => {
      const result = await upsertSessionMessage({
        message,
        projectId,
        sessionId,
        taskTitle,
      });

      return { sessionId: result.sessionId };
    },
    {
      body: z.object({
        message: z.string(),
        projectId: z.string(),
        sessionId: z.optional(z.string()),
        taskTitle: z.optional(z.string()),
      }),
    },
  )
  .post(
    'session/command',
    async ({ body: { args, command, projectId, sessionId }, set }) => {
      const result = await executeSessionCommand({
        args,
        command,
        projectId,
        sessionId,
      });

      // TODO: seems like a good pattern, except it probably should be in a middleware
      if ('error' in result) {
        set.status = result.status;
        return { error: result.error };
      }

      return { sessionId: result.sessionId };
    },
    {
      body: z.object({
        args: z.optional(z.string()),
        command: z.string(),
        projectId: z.string(),
        sessionId: z.optional(z.string()),
      }),
    },
  );
