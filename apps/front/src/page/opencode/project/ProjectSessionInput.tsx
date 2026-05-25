import {
  parseCommand,
  useExecuteSessionCommand,
  useSendSessionMessage,
} from '#/hooks/mutations/opencode/session.mutations';
import {
  useGetProjectCommands,
  useGetProjectFiles,
} from '#/hooks/queries/opencode/project.queries';
import type { KeyboardEvent } from 'react';
import { useState } from 'react';
import { AutoComplete } from './AutoComplete';

function getCurrentFileToken(text: string) {
  const split = text.split(' ');
  const lastToken = split.at(-1);
  if (lastToken?.startsWith('@')) {
    return lastToken.slice(1);
  }
}

export function ProjectSessionInput({
  onWaitingForResponseChange,
  projectId,
  sessionId,
}: {
  onWaitingForResponseChange: (waitingForResponse: boolean) => void;
  projectId: string;
  sessionId: string;
}) {
  const [commandAutoComplete, setCommandAutoComplete] = useState<string[]>([]);
  const [fileSearch, setFileSearch] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState('');
  const { data: { commands } = { commands: [] } } =
    useGetProjectCommands(projectId);
  const { data: { files } = { files: [] } } = useGetProjectFiles(
    projectId,
    fileSearch ?? '',
    fileSearch !== null,
  );
  const { mutate: executeCommand } = useExecuteSessionCommand(projectId);
  const { isPending: isSendingSessionMessage, mutate: sendSessionMessage } =
    useSendSessionMessage();
  const autoComplete = fileSearch !== null ? files : commandAutoComplete;

  function sendCurrentSessionMessage() {
    const message = sessionMessage.trim();

    if (!message || isSendingSessionMessage) {
      return;
    }
    const command = parseCommand(sessionMessage);
    onWaitingForResponseChange(true);

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
      return;
    }

    sendSessionMessage(
      {
        sessionId,
        projectId,
        message,
      },
      {
        onSuccess: () => setSessionMessage(''),
        onError: () => onWaitingForResponseChange(false),
      },
    );
  }

  function onSessionMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key !== 'Enter' || (!event.metaKey && event.shiftKey)) {
      return;
    }

    event.preventDefault();
    sendCurrentSessionMessage();
  }

  function onInputChange(text: string) {
    setSessionMessage(text);

    const fileToken = getCurrentFileToken(text);
    if (fileToken) {
      setFileSearch(fileToken);
      setCommandAutoComplete([]);
      return;
    }

    setFileSearch(null);

    if (text.startsWith('/') && !text.includes(' ')) {
      text = text.slice(1);
      const filtered = commands
        .filter((curr) => curr.name.includes(text))
        .map((curr) => curr.name);
      setCommandAutoComplete(filtered);
      return;
    }

    setCommandAutoComplete([]);
  }

  function onAutoCompleteSelect(suggestion: string) {
    if (fileSearch !== null) {
      setSessionMessage((current) =>
        current.replace(/@[^\s]*$/, `@${suggestion} `),
      );
      setFileSearch(null);
      return;
    }

    setSessionMessage(`/${suggestion} `);
    setCommandAutoComplete([]);
  }

  return (
    <div className="relative flex gap-3 border-white/10 border-t bg-gray-950/80 p-4">
      <AutoComplete
        onSelect={onAutoCompleteSelect}
        suggestions={autoComplete}
      />
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
