import type { Session } from '#/hooks/queries/opencode/project.queries';
import { useState } from 'react';
import { Resizable } from 're-resizable';

const DEFAULT_WIDTH = 220;

export function SessionList({
  sessions,
  onSessionClick,
}: {
  sessions: Session[] | null;
  onSessionClick: (session: Session) => void;
}) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  return (
    <Resizable
      className="border-r border-gray-700"
      enable={{ right: true }}
      maxWidth={480}
      minWidth={160}
      onResizeStop={(_event, _direction, ref) => setWidth(ref.offsetWidth)}
      size={{ width, height: '100%' }}
    >
      <div className="h-full overflow-y-auto flex flex-col gap-1">
        {!sessions ? (
          <div className="p-2 text-sm text-gray-400">Loading...</div>
        ) : (
          sessions.map((curr) => (
            <div
              onClick={() => onSessionClick(curr)}
              key={curr.id}
              className="mx-2 my-1 cursor-pointer truncate text-sm"
            >
              {curr.title}
            </div>
          ))
        )}
      </div>
    </Resizable>
  );
}
