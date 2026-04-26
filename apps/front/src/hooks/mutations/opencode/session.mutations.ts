import { useEden } from '#/lib/eden/client';
import { useMutation } from '@tanstack/react-query';

export function useSendSessionMessage() {
  const eden = useEden();

  return useMutation(eden.opencode.session.message.post.mutationOptions());
}
