import { useEffect } from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { queryClient } from '#/lib/query-client';
import { useEden, websocket } from '#/lib/eden/client';

import '../styles.css';

type WebsocketData = Parameters<
  Parameters<typeof websocket.subscribe>[0]
>[0]['data'];

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const eden = useEden();
  useEffect(() => {
    const handleMessage = ({ data }: { data: WebsocketData }) => {
      if (data.type === 'message.part.updated') {
        queryClient.invalidateQueries(
          eden.opencode.session({ id: data.sessionId }).get.queryOptions(),
        );
        queryClient.invalidateQueries(
          eden.opencode.projects.get.queryOptions(),
        );
      }
    };

    websocket.on('message', handleMessage);

    return () => {
      websocket.off('message', handleMessage);
    };
  }, []);

  return (
    <div className="bg-gray-800 h-dvh overflow-hidden text-white">
      <main className="h-full min-h-0 overflow-hidden">
        <Outlet />
      </main>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </div>
  );
}
