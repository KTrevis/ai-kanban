import Elysia from 'elysia';
import z from 'zod/v3';
import { GitRunError, runGit } from '../../git/git-runner';
import { HttpError } from '../../lib/http-error';
import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
} from './projects.service';

export const PROJECTS_CONTROLLER = new Elysia()
  .get('projects', async () => {
    return listProjects();
  })
  .get('projects/:projectId/checked-out-branch', async ({ params }) => {
    const project = await getProjectById(params.projectId);

    if (!project) {
      throw new HttpError(404, 'Project not found');
    }

    try {
      const { stdout } = await runGit(['branch', '--show-current'], {
        cwd: project.worktree,
      });

      return { branch: stdout.trim() || null };
    } catch (error) {
      throw new HttpError(
        400,
        error instanceof GitRunError
          ? error.result.stderr.trim() || error.message
          : 'Failed to get checked out branch',
      );
    }
  })
  .delete('projects/:projectId', async ({ params }) => {
    const project = await getProjectById(params.projectId);

    if (!project) {
      throw new HttpError(404, 'Project not found');
    }

    return deleteProject(params.projectId);
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
