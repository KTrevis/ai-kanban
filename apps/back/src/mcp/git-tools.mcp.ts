import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  commitVirtualChanges,
  getDiff,
  normalizeBranchRef,
  readFileFromRef,
  type VirtualBranchChange,
} from '../git/virtual-branch-writer';
import { KanbanColumn } from '../generated/prisma/enums';

const KANBAN_COLUMNS_SCHEMA = z.union([
  z.literal(KanbanColumn.AI),
  z.literal(KanbanColumn.DONE),
  z.literal(KanbanColumn.REVIEW),
  z.literal(KanbanColumn.TODO),
]);

type KanbanCardPatch = {
  baseBranch?: string;
  column?: z.infer<typeof KANBAN_COLUMNS_SCHEMA>;
  description?: string;
  newBranch?: string;
  position?: number;
  sessionId?: string | null;
  title?: string;
};

type KanbanCardCreate = {
  baseBranch?: string;
  column: z.infer<typeof KANBAN_COLUMNS_SCHEMA>;
  description: string;
  id?: string;
  position?: number;
  projectId: string;
  sessionId?: string | null;
  title: string;
};

const server = new McpServer({
  name: 'travaille-git-tools',
  version: '1.0.0',
});

server.registerTool(
  'read_file',
  {
    description: 'Read a file from a git ref without checking it out.',
    inputSchema: {
      path: z.string(),
      ref: z.string(),
      repoPath: z.string(),
    },
  },
  async ({ path, ref, repoPath }) => {
    const content = await readFileFromRef({ filePath: path, ref, repoPath });

    return textResult(content);
  },
);

server.registerTool(
  'write_file',
  {
    description:
      'Queue a file write for a git branch. This does not touch the worktree; call commit_changes to create the commit.',
    inputSchema: {
      branchRef: z.string(),
      content: z.string(),
      path: z.string(),
      repoPath: z.string(),
    },
  },
  async ({ branchRef, content, path, repoPath }) => {
    const normalizedBranchRef = normalizeBranchRef(branchRef);
    const changes = await readPendingChanges({
      branchRef: normalizedBranchRef,
      repoPath,
    });
    const nextChanges = upsertPendingChange(changes, {
      content,
      path,
      type: 'write',
    });
    await writePendingChanges({
      branchRef: normalizedBranchRef,
      changes: nextChanges,
      repoPath,
    });

    return textResult(`Queued write for ${path} on ${normalizedBranchRef}`);
  },
);

server.registerTool(
  'commit_changes',
  {
    description:
      'Commit queued file writes to a git branch without checking it out or modifying the worktree.',
    inputSchema: {
      baseRef: z.string().optional(),
      branchRef: z.string(),
      message: z.string(),
      repoPath: z.string(),
    },
  },
  async ({ baseRef, branchRef, message, repoPath }) => {
    const normalizedBranchRef = normalizeBranchRef(branchRef);
    const changes = await readPendingChanges({
      branchRef: normalizedBranchRef,
      repoPath,
    });

    if (changes.length === 0) {
      return textResult('No pending changes to commit.');
    }

    const result = await commitVirtualChanges({
      baseRef,
      branchRef: normalizedBranchRef,
      changes,
      message,
      repoPath,
    });
    await clearPendingChanges({ branchRef: normalizedBranchRef, repoPath });

    return textResult(
      [
        `Committed ${changes.length} pending change(s).`,
        `Branch: ${result.branchRef}`,
        `Commit: ${result.commitOid}`,
        `Parent: ${result.parentOid}`,
      ].join('\n'),
    );
  },
);

server.registerTool(
  'get_diff',
  {
    description: 'Get the committed diff between a base ref and a branch ref.',
    inputSchema: {
      baseRef: z.string(),
      branchRef: z.string(),
      repoPath: z.string(),
    },
  },
  async ({ baseRef, branchRef, repoPath }) => {
    const diff = await getDiff({
      baseRef,
      branchRef: normalizeBranchRef(branchRef),
      repoPath,
    });

    return textResult(diff || 'No committed diff.');
  },
);

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
    description: 'List Kanban cards for a project, ordered by column and position.',
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
      'Patch mutable fields on a Kanban card, such as column, sessionId, branches, title, description, or position.',
    inputSchema: {
      baseBranch: z.string().optional(),
      cardId: z.string(),
      column: KANBAN_COLUMNS_SCHEMA.optional(),
      description: z.string().optional(),
      newBranch: z.string().optional(),
      position: z.number().int().optional(),
      sessionId: z.string().nullable().optional(),
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

async function readPendingChanges({
  branchRef,
  repoPath,
}: {
  branchRef: string;
  repoPath: string;
}) {
  try {
    const content = await readFile(
      getPendingChangesPath({ branchRef, repoPath }),
      'utf8',
    );

    return JSON.parse(content) as VirtualBranchChange[];
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writePendingChanges({
  branchRef,
  changes,
  repoPath,
}: {
  branchRef: string;
  changes: VirtualBranchChange[];
  repoPath: string;
}) {
  const pendingChangesPath = getPendingChangesPath({ branchRef, repoPath });
  await mkdir(dirname(pendingChangesPath), { recursive: true });
  await writeFile(pendingChangesPath, JSON.stringify(changes, null, 2));
}

async function clearPendingChanges({
  branchRef,
  repoPath,
}: {
  branchRef: string;
  repoPath: string;
}) {
  await rm(getPendingChangesPath({ branchRef, repoPath }), { force: true });
}

function upsertPendingChange(
  changes: VirtualBranchChange[],
  change: VirtualBranchChange,
) {
  return [...changes.filter((current) => current.path !== change.path), change];
}

function getPendingChangesPath({
  branchRef,
  repoPath,
}: {
  branchRef: string;
  repoPath: string;
}) {
  const key = createHash('sha256')
    .update(`${repoPath}\0${branchRef}`)
    .digest('hex');

  return join(tmpdir(), 'travaille-git-mcp', `${key}.json`);
}
