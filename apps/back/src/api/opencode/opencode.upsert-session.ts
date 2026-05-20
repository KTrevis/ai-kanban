import { opencodeClient } from './opencode.controller';
import { notifyAgentTaskStarted } from '../../lib/notifications';
import { patchCard } from '../kanban/patch-card';
import { prisma } from '../../lib/prisma';
import { getCheckedOutBranch } from '../../git/virtual-branch-writer';

export async function upsertSessionMessage(cardId: string) {
  const card = await prisma.kanbanCard.findUniqueOrThrow({
    where: {
      id: cardId,
    },
    select: {
      sessionId: true,
      title: true,
      description: true,
      useTravailleMcp: true,
      baseBranch: true,
      id: true,
      project: {
        select: {
          id: true,
          worktree: true,
        },
      },
    },
  });
  const sessionId = card.sessionId;
  const sessionExists = sessionId?.length;
  const targetSessionId = sessionExists
    ? sessionId
    : await createSession(card.project.worktree);
  const branch =
    card.baseBranch === 'HEAD'
      ? ((await getCheckedOutBranch(card.project.worktree)) ?? 'HEAD')
      : card.baseBranch;
  await patchCard(cardId, {
    sessionId: targetSessionId,
    baseBranch: branch,
  });

  const travailleMcpInstructions =
    card.useTravailleMcp !== false
      ? `Utilise le MCP travaille pour réaliser cette tâche.
      Interdiction stricte : ne crée pas et n'utilise pas de git worktree.
      Pour lire, modifier, committer ou comparer du code sur la branche cible, utilise les outils MCP travaille : travaille_read_file, travaille_write_file, travaille_commit_changes et travaille_get_diff.
      Choisis un nom de branche court et descriptif au format ai/<slug>, par exemple ai/fix-login ou ai/add-kanban-filter.
      Avant de modifier le code, mets à jour la carte Kanban avec travaille_patch_kanban_card en définissant newBranch avec le nom de branche choisi.
      Utilise ensuite exactement ce même nom de branche pour tous les outils MCP travaille qui demandent branchRef.
      Si jamais la carte te demande explicitement de ne pas écrire de code, ne crée pas la branche, réponds juste dans la conversation au message.
      Tu dois tout de même lire le code si tu en as besoin pour répondre à la question.`
      : '';
  const message = [
    `Réalise la tâche suivante :`,
    `Titre de la tâche : ${card.title}`,
    `Description de la tâches : ${card.description}`,
    `Branche sur laquelle te baser : ${branch}`,
    `ID de la carte Kanban : ${card.id}`,
    travailleMcpInstructions,
    `Quand tu as fini, place la carte dans la colonne REVIEW.`,
  ].join('\n\n');

  await opencodeClient.session.promptAsync({
    body: {
      parts: [
        {
          text: message,
          type: 'text',
        },
      ],
    },
    path: { id: targetSessionId },
    query: { directory: card.project.worktree },
  });
  notifyAgentTaskStarted(card.title);

  return { sessionId: targetSessionId };
}

async function createSession(directory: string) {
  const { data: session } = await opencodeClient.session.create({
    query: { directory },
  });

  if (!session) {
    throw new Error('Failed to create session');
  }

  return session.id;
}
