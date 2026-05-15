import { useEden } from '#/lib/eden/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export type SessionMessage = NonNullable<
  NonNullable<ReturnType<typeof useGetSession>['data']>['messages']
>[number];

export type MessagePart = SessionMessage['parts'][number];
export type MessagePartType = MessagePart['type'];

export function useGetSession(sessionId: string) {
  const eden = useEden();
  return useQuery(eden.opencode.session({ id: sessionId }).get.queryOptions());
}

export function useInvalidateSessionMessages() {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useCallback(
    (sessionId: string) => {
      return queryClient.invalidateQueries(
        eden.opencode.session({ id: sessionId }).get.queryOptions(),
      );
    },
    [eden, queryClient],
  );
}
