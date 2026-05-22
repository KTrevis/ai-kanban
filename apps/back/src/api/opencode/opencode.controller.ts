import Elysia from 'elysia';
import {
  createOpencode,
  createOpencodeClient,
  type OpencodeClient,
} from '@opencode-ai/sdk';
import { ENVIRONMENT } from '../../schema/env.schema';
import { HttpError } from '../../lib/http-error';
import {
  executeSessionCommand,
  STOP_SESSION_COMMAND,
} from './opencode.execute-command';
import { getProjectById } from '../projects/projects.service';
import { getProjectSessions } from './opencode.sessions';
import { upsertSessionMessage } from './opencode.upsert-session';
import z from 'zod/v3';
import { SESSION_MESSAGE_SCHEMA } from './session-message.schema';

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
  .get('project/:id/commands', async ({ params: { id } }) => {
    const project = await getProjectById(id);
    const { data: commands = [] } = await opencodeClient.command.list({
      query: { directory: project?.worktree },
    });

    return {
      commands: [
        ...commands,
        {
          description: 'Revert the last message in the session',
          name: 'undo',
          template: '',
        },
        {
          name: STOP_SESSION_COMMAND,
          description: 'Stop the current response',
          template: '',
        },
      ],
    };
  })
  .get(
    'project/:id/files',
    async ({ params: { id }, query: { q } }) => {
      const project = await getProjectById(id);

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
    'session',
    async ({ body: { projectId } }) => {
      const project = await getProjectById(projectId);

      if (!project) {
        throw new HttpError(404, 'Project not found');
      }

      const { data: session } = await opencodeClient.session.create({
        query: { directory: project.worktree },
      });

      if (!session) {
        throw new HttpError(500, 'Failed to create session');
      }

      return { sessionId: session.id };
    },
    {
      body: z.object({
        projectId: z.string(),
      }),
    },
  )
  .post(
    'session/message',
    async ({ body }) => await upsertSessionMessage(body),
    {
      body: SESSION_MESSAGE_SCHEMA,
    },
  )
  .post(
    'session/command',
    async ({ body: { args, command, projectId, sessionId } }) => {
      const result = await executeSessionCommand({
        args,
        command,
        projectId,
        sessionId,
      });

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
