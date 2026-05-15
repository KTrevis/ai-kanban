import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEden, websocket } from '#/lib/eden/client';
import { dispatchAppEvent } from './use-app-event';

type WebsocketData = Parameters<
  Parameters<typeof websocket.subscribe>[0]
>[0]['data'];

export function useHandleWsMessages() {
  const eden = useEden();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = ({ data }: { data: WebsocketData }) => {
      if (data.type === 'cards.updated') {
        queryClient.invalidateQueries(
          eden.kanban.cards({ projectId: data.projectId }).get.queryOptions(),
        );
      }

      if (
        data.type === 'opencode.message.updated' ||
        data.type === 'opencode.message.part.updated' ||
        data.type === 'opencode.session.idle'
      ) {
        queryClient.invalidateQueries(
          eden.opencode.session({ id: data.sessionId }).get.queryOptions(),
        );
      }

      if (data.type === 'opencode.session.idle') {
        dispatchAppEvent('opencode.session.idle', {
          sessionId: data.sessionId,
        });
      }
    };

    websocket.on('message', handleMessage);

    return () => {
      websocket.off('message', handleMessage);
    };
  }, [eden, queryClient]);
}
