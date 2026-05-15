import { SessionMessages } from '#/components/opencode/messages/SessionMessages';
import { useAppEvent } from '#/hooks/use-app-event';
import { useEffect, useState } from 'react';
import { ProjectSessionInput } from './ProjectSessionInput';

export function ProjectSessionPanel({
  projectId,
  sessionId,
}: {
  projectId: string;
  sessionId: string;
}) {
  const [waitingForSessionResponse, setWaitingForSessionResponse] =
    useState(false);

  useEffect(() => {
    setWaitingForSessionResponse(false);
  }, [sessionId]);

  useAppEvent('opencode.session.idle', ({ sessionId: idleSessionId }) => {
    if (idleSessionId === sessionId) {
      setWaitingForSessionResponse(false);
    }
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <SessionMessages
          id={sessionId}
          waitingForResponse={waitingForSessionResponse}
        />
      </div>
      <ProjectSessionInput
        projectId={projectId}
        sessionId={sessionId}
        onWaitingForResponseChange={setWaitingForSessionResponse}
      />
    </div>
  );
}
