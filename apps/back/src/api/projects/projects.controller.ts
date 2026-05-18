import Elysia from 'elysia';
import z from 'zod/v3';
import { createProject, listProjects } from './projects.service';

export const PROJECTS_CONTROLLER = new Elysia()
  .get('projects', async () => {
    return listProjects();
  })
  .post(
    'projects',
    async ({ body: { name, worktree } }) => {
      return createProject({
        name: name.trim(),
        worktree: worktree.trim(),
      });
    },
    {
      body: z.object({
        name: z.string().min(1),
        worktree: z.string().min(1),
      }),
    },
  );
