import { SessionMessages } from '#/components/opencode/messages/SessionMessages';
import { ProjectList } from '#/components/opencode/ProjectList';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import {
  type KanbanCard,
  useGetKanbanCards,
  useMoveKanbanCards,
} from '#/hooks/queries/kanban/kanban.queries';
import { KanbanPage, type CardMovedEvent } from '#/page/kanban/KanbanPage';

export function ProjectPage({
  projectId,
  sessionId,
}: {
  projectId: string;
  sessionId?: string;
}) {
  const { data: cards } = useGetKanbanCards(projectId);
  const { mutate: moveCards } = useMoveKanbanCards(projectId);
  const { mutate: sendSessionMessage } = useSendSessionMessage();

  function startAgentSession(card: KanbanCard) {
    sendSessionMessage({
      projectId,
      sessionId: card.sessionId ?? undefined,
      taskTitle: card.title,
      message: `Utilise le MCP travaille pour réaliser la tâche suivante :
        Titre de la tâche : ${card.title}
        Description de la tâches : ${card.description}
        Branche sur laquelle te baser : ${card.baseBranch}
        Nom de la branche à créer (ou simplement à modifier si elle existe déjà) : ${card.newBranch}
        ID de la carte Kanban : ${card.id}
        Quand tu as fini, place la carte dans la colonne REVIEW, et rajoute lui le SESSION_ID`,
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

  return (
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      {sessionId ? (
        <SessionMessages id={sessionId} />
      ) : (
        <KanbanPage
          cards={cards ?? []}
          projectId={projectId}
          onCardCreated={onCardCreated}
          onCardMoved={onCardMoved}
        />
      )}
    </div>
  );
}
