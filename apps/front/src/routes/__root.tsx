import { useEffect } from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { queryClient } from '#/lib/query-client';
import { useEden, websocket } from '#/lib/eden/client';

import '../styles.css';
import { Toaster } from '#/components/ui/sonner';

type WebsocketData = Parameters<
  Parameters<typeof websocket.subscribe>[0]
>[0]['data'];

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const eden = useEden();

  // TODO: separate hook to handle incoming ws messages
  useEffect(() => {
    const handleMessage = ({ data }: { data: WebsocketData }) => {
      if (data.type === 'cards.updated') {
        console.log('card updated');
        queryClient.invalidateQueries(
          eden.kanban.cards({ projectId: data.projectId }).get.queryOptions(),
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
        <Toaster richColors />
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
