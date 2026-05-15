import { AutoCompleteCard } from '#/components/opencode/AutocompleteCard';
import {
  parseCommand,
  useExecuteSessionCommand,
  useSendSessionMessage,
} from '#/hooks/mutations/opencode/session.mutations';
import { useGetProjectCommands } from '#/hooks/queries/opencode/project.queries';
import type { KeyboardEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ProjectSessionInput({
  onWaitingForResponseChange,
  projectId,
  sessionId,
}: {
  onWaitingForResponseChange: (waitingForResponse: boolean) => void;
  projectId: string;
  sessionId: string;
}) {
  const [autoComplete, setAutoComplete] = useState<string[]>([]);
  const [sessionMessage, setSessionMessage] = useState('');
  const { data: { commands } = { commands: [] } } =
    useGetProjectCommands(projectId);
  const { mutate: executeCommand } = useExecuteSessionCommand(projectId);
  const { isPending: isSendingSessionMessage, mutate: sendSessionMessage } =
    useSendSessionMessage();

  function sendCurrentSessionMessage() {
    const message = sessionMessage.trim();

    if (!message || isSendingSessionMessage) {
      return;
    }
    const command = parseCommand(sessionMessage);

    if (command) {
      executeCommand(
        {
          command: command.name,
          args: command.args,
          projectId,
          sessionId,
        },
        {
          onSettled() {
            onWaitingForResponseChange(false);
          },
        },
      );
      setSessionMessage('');
      onWaitingForResponseChange(true);
      return;
    }

    sendSessionMessage(
      {
        message,
        projectId,
        sessionId,
      },
      {
        onSuccess: () => setSessionMessage(''),
        onError: () => onWaitingForResponseChange(false),
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

  function onInputChange(text: string) {
    setSessionMessage(text);

    if (text.startsWith('/')) {
      text = text.slice(1);
      const filtered = commands
        .filter((curr) => curr.name.includes(text))
        .map((curr) => curr.name);
      setAutoComplete(filtered);
      return;
    }
    setAutoComplete([]);
  }

  return (
    <div className="relative flex gap-3 border-white/10 border-t bg-gray-950/80 p-4">
      {autoComplete.length > 0 && (
        <div className="absolute right-4 bottom-full left-4 z-50 mb-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-gray-950/95 p-2 shadow-2xl">
          {autoComplete.map((curr) => (
            <AutoCompleteCard key={curr} name={curr} />
          ))}
        </div>
      )}
      <textarea
        className="min-h-24 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
        disabled={isSendingSessionMessage}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={onSessionMessageKeyDown}
        placeholder="Envoyer un message dans la session..."
        value={sessionMessage}
      />
    </div>
  );
}
