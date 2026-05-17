import { ProjectList } from '#/components/opencode/ProjectList';
import { useSendSessionMessage } from '#/hooks/mutations/opencode/session.mutations';
import {
  type KanbanCard,
  useGetKanbanCards,
  useMoveKanbanCards,
} from '#/hooks/queries/kanban/kanban.queries';
import type { CardMovedEvent } from '#/page/kanban/KanbanPage';
import { ProjectContent } from './ProjectContent';

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
  const { data: cards } = useGetKanbanCards(projectId);
  const { mutate: moveCards } = useMoveKanbanCards(projectId);
  const { mutate: sendSessionMessage } = useSendSessionMessage();

  function startAgentSession(card: KanbanCard) {
    const travailleMcpInstructions =
      card.useTravailleMcp !== false
        ? `
        Utilise le MCP travaille pour réaliser cette tâche.
        Interdiction stricte : ne crée pas et n'utilise pas de git worktree.
        Pour lire, modifier, committer ou comparer du code sur la branche cible, utilise les outils MCP travaille : travaille_read_file, travaille_write_file, travaille_commit_changes et travaille_get_diff.
        Choisis un nom de branche court et descriptif au format ai/<slug>, par exemple ai/fix-login ou ai/add-kanban-filter.
        Avant de modifier le code, mets à jour la carte Kanban avec travaille_patch_kanban_card en définissant newBranch avec le nom de branche choisi.
        Utilise ensuite exactement ce même nom de branche pour tous les outils MCP travaille qui demandent branchRef.
        Si jamais la carte te demande explicitement de ne pas écrire de code, ne crée pas la branche, réponds juste dans la conversation au message.
        Tu dois tout de même lire le code si tu en as besoin pour répondre à la question.`
        : '';

    sendSessionMessage({
      projectId,
      sessionId: card.sessionId ?? undefined,
      taskTitle: card.title,
      message: `Réalise la tâche suivante :
        Titre de la tâche : ${card.title}
        Description de la tâches : ${card.description}
        Branche sur laquelle te baser : ${card.baseBranch}
        ID de la carte Kanban : ${card.id}${travailleMcpInstructions}
        Avant de commencer ta tâche, rajoute le SESSION_ID à la carte.
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

  return (
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      <ProjectContent
        cards={cards ?? []}
        cardId={cardId}
        projectId={projectId}
        sessionId={sessionId}
        onCardCreated={onCardCreated}
        onCardIdChange={onCardIdChange}
        onCardMoved={onCardMoved}
      />
    </div>
  );
}
