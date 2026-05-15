import { SessionMessages } from '#/components/opencode/messages/SessionMessages';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import { useGetProjectCommands } from '#/hooks/queries/opencode/project.queries';
import { useAppEvent } from '#/hooks/use-app-event';
import type { KeyboardEvent } from 'react';
import { useEffect, useState } from 'react';

export function ProjectSessionPanel({
  projectId,
  sessionId,
}: {
  projectId: string;
  sessionId: string;
}) {
  const { data: commands } = useGetProjectCommands(projectId);
  const [sessionMessage, setSessionMessage] = useState('');
  const [waitingForSessionResponse, setWaitingForSessionResponse] =
    useState(false);
  const { isPending: isSendingSessionMessage, mutate: sendSessionMessage } =
    useSendSessionMessage();

  useEffect(() => {
    setWaitingForSessionResponse(false);
  }, [sessionId]);

  useAppEvent('opencode.session.idle', ({ sessionId: idleSessionId }) => {
    if (idleSessionId === sessionId) {
      setWaitingForSessionResponse(false);
    }
  });

  function sendCurrentSessionMessage() {
    const message = sessionMessage.trim();

    if (!message || isSendingSessionMessage) {
      return;
    }

    setWaitingForSessionResponse(true);

    sendSessionMessage(
      {
        message,
        projectId,
        sessionId,
      },
      {
        onSuccess: () => setSessionMessage(''),
        onError: () => setWaitingForSessionResponse(false),
      },
    );
  }

  function onSessionMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || (!event.metaKey && event.shiftKey)) {
      return;
    }

    event.preventDefault();
    sendCurrentSessionMessage();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <SessionMessages
          id={sessionId}
          waitingForResponse={waitingForSessionResponse}
        />
      </div>
      <div className="flex gap-3 border-white/10 border-t bg-gray-950/80 p-4">
        <textarea
          className="min-h-24 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
          disabled={isSendingSessionMessage}
          onChange={(event) => setSessionMessage(event.target.value)}
          onKeyDown={onSessionMessageKeyDown}
          placeholder="Envoyer un message dans la session..."
          value={sessionMessage}
        />
      </div>
    </div>
  );
}
