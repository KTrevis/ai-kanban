import { useEden } from '#/lib/eden/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useSendSessionMessage() {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation(
    eden.opencode.session.message.post.mutationOptions({
      onSuccess({ sessionId }) {
        if (!sessionId) {
          return;
        }

        queryClient.invalidateQueries(
          eden.opencode.session({ id: sessionId }).get.queryOptions(),
        );
      },
    }),
  );
}
