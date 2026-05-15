import { SessionMessages } from '#/components/opencode/messages/SessionMessages';
import { ProjectList } from '#/components/opencode/ProjectList';
import { useAppEvent } from '#/hooks/use-app-event';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import {
  type KanbanCard,
  useGetKanbanCards,
  useMoveKanbanCards,
} from '#/hooks/queries/kanban/kanban.queries';
import { KanbanPage, type CardMovedEvent } from '#/page/kanban/KanbanPage';
import type { KeyboardEvent } from 'react';
import { useEffect, useState } from 'react';

export function ProjectPage({
  cardId,
  onCardIdChange,
  projectId,
  sessionId,
}: {
  cardId?: string;
  onCardIdChange: (cardId?: string) => void;
  projectId: string;
  sessionId?: string;
}) {
  const [sessionMessage, setSessionMessage] = useState('');
  const [waitingForSessionResponse, setWaitingForSessionResponse] =
    useState(false);
  const { data: cards } = useGetKanbanCards(projectId);
  const { mutate: moveCards } = useMoveKanbanCards(projectId);
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

  function startAgentSession(card: KanbanCard) {
    sendSessionMessage({
      projectId,
      sessionId: card.sessionId ?? undefined,
      taskTitle: card.title,
      message: `Utilise le MCP travaille pour réaliser la tâche suivante :
        Titre de la tâche : ${card.title}
        Description de la tâches : ${card.description}
        Branche sur laquelle te baser : ${card.baseBranch}
        ID de la carte Kanban : ${card.id}

        Interdiction stricte : ne crée pas et n'utilise pas de git worktree.
        Pour lire, modifier, committer ou comparer du code sur la branche cible, utilise les outils MCP travaille : travaille_read_file, travaille_write_file, travaille_commit_changes et travaille_get_diff.
        Choisis un nom de branche court et descriptif au format ai/<slug>, par exemple ai/fix-login ou ai/add-kanban-filter.
        Avant de modifier le code, mets à jour la carte Kanban avec travaille_patch_kanban_card en définissant newBranch avec le nom de branche choisi.
        Utilise ensuite exactement ce même nom de branche pour tous les outils MCP travaille qui demandent branchRef.
        Avant de commencer ta tâche, rajoue le SESSION_ID à la carte.
        Quand tu as fini, place la carte dans la colonne REVIEW.`,
    });
  }

  function onCardMoved({ card, cards }: CardMovedEvent) {
    if (card.column === 'AI') {
      startAgentSession(card);
    }
    moveCards(
      cards.map((card, position) => ({
        column: card.column,
        id: card.id,
        position,
        projectId: card.projectId,
      })),
    );
  }

  function onCardCreated(card: KanbanCard) {
    if (card.column === 'AI') {
      startAgentSession(card);
    }
  }

  function sendCurrentSessionMessage() {
    const message = sessionMessage.trim();

    if (!sessionId || !message || isSendingSessionMessage) {
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
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      {sessionId ? (
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
      ) : (
        <KanbanPage
          cards={cards ?? []}
          cardId={cardId}
          projectId={projectId}
          onCardIdChange={onCardIdChange}
          onCardCreated={onCardCreated}
          onCardMoved={onCardMoved}
        />
      )}
    </div>
  );
}
