import { Outlet, createRootRoute } from '@tanstack/react-router';
import { useHandleWsMessages } from '#/hooks/use-handle-ws-messages';

import '../styles.css';
import { Toaster } from '#/components/ui/sonner';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useHandleWsMessages();

  return (
    <div className="bg-gray-800 h-dvh overflow-hidden text-white">
      <main className="h-full min-h-0 overflow-hidden">
        <Outlet />
        <Toaster richColors />
      </main>
    </div>
  );
}
