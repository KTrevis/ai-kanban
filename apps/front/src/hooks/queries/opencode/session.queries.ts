import { useEden } from '#/lib/eden/client';
import { useQuery } from '@tanstack/react-query';

export type SessionMessage = NonNullable<
  NonNullable<ReturnType<typeof useGetSession>['data']>['messages']
>[number];

export type MessagePart = SessionMessage['parts'][number];
export type MessagePartType = MessagePart['type'];

export function useGetSession(sessionId: string) {
  const eden = useEden();
  return useQuery(eden.opencode.session({ id: sessionId }).get.queryOptions());
}
