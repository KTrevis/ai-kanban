export type GitRunOptions = {
  cwd: string;
  env?: NodeJS.ProcessEnv;
  input?: string | Uint8Array;
  timeoutMs?: number;
};

export type GitRunResult = {
  args: string[];
  code: number;
  cwd: string;
  stderr: string;
  stdout: string;
};

export class GitRunError extends Error {
  readonly result: GitRunResult;

  constructor(message: string, result: GitRunResult) {
    super(message);
    this.name = 'GitRunError';
    this.result = result;
  }
}

export async function runGit(
  args: string[],
  { cwd, env, input, timeoutMs = 30_000 }: GitRunOptions,
): Promise<GitRunResult> {
  const child = Bun.spawn(['git', ...args], {
    cwd,
    env: getProcessEnv(env),
    stderr: 'pipe',
    stdin: 'pipe',
    stdout: 'pipe',
  });

  let didTimeout = false;
  const timeout = setTimeout(() => {
    didTimeout = true;
    child.kill('SIGTERM');
  }, timeoutMs);

  if (input) {
    await child.stdin.write(input);
  }
  child.stdin.end();

  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  clearTimeout(timeout);

  const result: GitRunResult = {
    args,
    code,
    cwd,
    stderr,
    stdout,
  };

  if (didTimeout) {
    throw new GitRunError(`git ${args.join(' ')} timed out`, result);
  }

  if (result.code !== 0) {
    throw new GitRunError(`git ${args.join(' ')} failed`, result);
  }

  return result;
}

function getProcessEnv(env: NodeJS.ProcessEnv = {}) {
  const nextEnv: Record<string, string> = {};

  for (const [key, value] of Object.entries({ ...process.env, ...env })) {
    if (value !== undefined) {
      nextEnv[key] = value;
    }
  }

  return nextEnv;
}
