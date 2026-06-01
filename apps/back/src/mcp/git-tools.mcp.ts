import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { AnySchema } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import { z } from 'zod/v3';
import { KanbanColumn } from '../generated/prisma/enums';

type KanbanColumnValue = (typeof KanbanColumn)[keyof typeof KanbanColumn];

const KANBAN_COLUMNS_SCHEMA = z.enum([
  KanbanColumn.AI,
  KanbanColumn.DONE,
  KanbanColumn.REVIEW,
  KanbanColumn.TODO,
]);

type KanbanCardPatch = {
  baseBranch?: string;
  column?: KanbanColumnValue;
  description?: string;
  newBranch?: string;
  position?: number;
  sessionId?: string | null;
  title?: string;
};

type KanbanCardCreate = {
  baseBranch?: string;
  column: KanbanColumnValue;
  description: string;
  id?: string;
  position?: number;
  projectId: string;
  sessionId?: string | null;
  title: string;
};

const server = new McpServer({
  name: 'travaille-kanban-tools',
  version: '1.0.0',
});

server.registerTool(
  'create_kanban_card',
  {
    description:
      'Create a Kanban card. Position is optional and defaults to the end of the target column.',
    inputSchema: {
      baseBranch: z.string().optional(),
      column: KANBAN_COLUMNS_SCHEMA,
      description: z.string(),
      id: z.string().optional(),
      position: z.number().int().optional(),
      projectId: z.string(),
      sessionId: z.string().nullable().optional(),
      title: z.string(),
    },
  },
  async (data) => {
    const body = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as KanbanCardCreate;

    const response = await fetchKanbanApi('kanban/card', {
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      return textResult(await getApiErrorMessage(response));
    }

    return jsonResult(await response.json());
  },
);

server.registerTool(
  'get_kanban_card',
  {
    description: 'Get a Kanban card by id.',
    inputSchema: {
      cardId: z.string(),
    },
  },
  async ({ cardId }) => {
    const response = await fetchKanbanApi(
      `kanban/card/${encodeURIComponent(cardId)}`,
    );

    if (!response.ok) {
      return textResult(await getApiErrorMessage(response));
    }

    return jsonResult(await response.json());
  },
);

server.registerTool(
  'list_kanban_cards',
  {
    description:
      'List Kanban cards for a project, ordered by column and position.',
    inputSchema: {
      projectId: z.string(),
    },
  },
  async ({ projectId }) => {
    const response = await fetchKanbanApi(
      `kanban/cards/${encodeURIComponent(projectId)}`,
    );

    if (!response.ok) {
      return textResult(await getApiErrorMessage(response));
    }

    return jsonResult(await response.json());
  },
);

server.registerTool(
  'patch_kanban_card',
  {
    description:
      'Patch a card. Every fields are optional, expected for cardId.',
    inputSchema: {
      baseBranch: z.string().optional(),
      cardId: z.string(),
      column: KANBAN_COLUMNS_SCHEMA.optional(),
      description: z.string().optional(),
      newBranch: z.string().optional(),
      position: z.number().int().optional(),
      sessionId: z.string().optional(),
      title: z.string().optional(),
    },
  },
  async ({ cardId, ...data }) => {
    const patch = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as KanbanCardPatch;

    if (Object.keys(patch).length === 0) {
      return textResult('No Kanban card fields provided to patch.');
    }

    const response = await fetchKanbanApi(
      `kanban/card/${encodeURIComponent(cardId)}`,
      {
        body: JSON.stringify(patch),
        headers: { 'content-type': 'application/json' },
        method: 'PATCH',
      },
    );

    if (!response.ok) {
      return textResult(await getApiErrorMessage(response));
    }

    return jsonResult(await response.json());
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

function textResult(text: string) {
  return {
    content: [
      {
        text,
        type: 'text' as const,
      },
    ],
  };
}

function jsonResult(value: unknown) {
  return textResult(JSON.stringify(value, null, 2));
}

async function fetchKanbanApi(path: string, init?: RequestInit) {
  return fetch(new URL(path, getBackendUrl()), init);
}

async function getApiErrorMessage(response: Response) {
  const body = await response.text();
  return `Kanban API request failed: ${response.status} ${response.statusText}${
    body ? `\n${body}` : ''
  }`;
}

function getBackendUrl() {
  const backendUrl = process.env.TRAVAILLE_API_URL ?? 'http://localhost:420/';
  return backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
}
