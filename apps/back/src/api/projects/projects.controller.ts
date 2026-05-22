import Elysia from 'elysia';
import z from 'zod/v3';
import { GitRunError, runGit } from '../../git/git-runner';
import { createProject, getProjectById, listProjects } from './projects.service';

export const PROJECTS_CONTROLLER = new Elysia()
  .get('projects', async () => {
    return listProjects();
  })
  .get('projects/:projectId/checked-out-branch', async ({ params, set }) => {
    const project = await getProjectById(params.projectId);

    if (!project) {
      set.status = 404;
      return { error: 'Project not found' };
    }

    try {
      const { stdout } = await runGit(['branch', '--show-current'], {
        cwd: project.worktree,
      });

      return { branch: stdout.trim() || null };
    } catch (error) {
      set.status = 400;
      return {
        error:
          error instanceof GitRunError
            ? error.result.stderr.trim() || error.message
            : 'Failed to get checked out branch',
      };
    }
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
