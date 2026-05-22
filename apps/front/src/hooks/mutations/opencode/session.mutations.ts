import { useEden } from '#/lib/eden/client';
import { useInvalidateSessionMessages } from '#/hooks/queries/opencode/session.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetProjectCommands } from '#/hooks/queries/opencode/project.queries';
import { toast } from 'sonner';

export function useCreateProjectSession() {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation(
    eden.opencode.session.post.mutationOptions({
      onSuccess(_, { projectId }) {
        queryClient.invalidateQueries(
          eden.opencode.project({ id: projectId }).get.queryOptions(),
        );
      },
    }),
  );
}

export function useSendSessionMessage() {
  const eden = useEden();
  const invalidateSessionMessages = useInvalidateSessionMessages();

  return useMutation(
    eden.opencode.session.message.post.mutationOptions({
      onSuccess({ sessionId }) {
        invalidateSessionMessages(sessionId);
      },
    }),
  );
}

export function parseCommand(command: string) {
  if (!command.startsWith('/')) {
    return null;
  }
  const split = command.slice(1).split(' ');
  const name = split[0];
  const args = split.slice(1).join(' ');
  return { name, args };
}

export function useExecuteSessionCommand(projectId: string) {
  const { data: { commands } = { commands: [] } } =
    useGetProjectCommands(projectId);
  const eden = useEden();
  const invalidateSessionMessages = useInvalidateSessionMessages();

  return useMutation(
    eden.opencode.session.command.post.mutationOptions({
      onMutate({ command, sessionId }) {
        if (!sessionId) {
          return;
        }
        if (!commands.map((curr) => curr.name).includes(command)) {
          toast.error('This command does not exist');
          return;
        }

        invalidateSessionMessages(sessionId);
      },
      onSuccess({ sessionId }) {
        invalidateSessionMessages(sessionId);
      },
    }),
  );
}
