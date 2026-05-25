import { opencodeClient } from './opencode.controller';
import { notifyAgentTaskStarted } from '../../lib/notifications';
import { patchCard } from '../kanban/patch-card';
import { prisma } from '../../lib/prisma';
import { getCheckedOutBranch } from '../../git/git-refs';
import type {
  SendMessageToCardData,
  SendMessageToSessionData,
} from './session-message.schema';

function buildPrompt(card: {
  title: string;
  description: string;
  branch: string;
  id: string;
}) {
  const message = [
    `Réalise la tâche suivante :`,
    `Titre de la tâche : ${card.title}`,
    `Description de la tâches : ${card.description}`,
    `Branche sur laquelle te baser : ${card.branch}`,
    `ID de la carte Kanban : ${card.id}`,
    "N'écris JAMAIS dans le worktree courant. Crée et utilise un git worktree dédié pour travailler sur cette tâche, afin de ne pas perturber le workspace principal.",
    'Ne fais jamais git checkout ou git switch vers la branche de travail dans le workspace principal. Tu dois travailler uniquement dans le worktree dédié.',
    'Choisis un nom de branche court et descriptif au format ai/<slug>, par exemple ai/fix-login ou ai/add-kanban-filter.',
    'Si cette branche ai/<slug> existe déjà, recrée un worktree dédié avec git worktree add <chemin> ai/<slug> au lieu de la checkout dans le workspace principal.',
    'Si Git indique que la branche est déjà checkout dans un autre worktree, utilise ce worktree existant.',
    'Avant de modifier le code, mets à jour la carte Kanban en définissant newBranch avec le nom de branche choisi.',
    "Quand tu as terminé, place la carte dans la colonne REVIEW et supprime le worktree temporaire que tu as créé uniquement si le résultat utile est persisté et que git status --porcelain y est vide. S'il reste des changements non commités, commit les.",
    "Si l'utilisateur te relance, pense bien à recréer le worktree, n'écris surtout pas le worktree courant.",
  ].join('\n\n');

  return message;
}

export async function createSessionFromCard({ cardId }: SendMessageToCardData) {
  const card = await prisma.kanbanCard.findUniqueOrThrow({
    where: {
      id: cardId,
    },
    select: {
      sessionId: true,
      title: true,
      description: true,
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

  if (card.sessionId?.length) {
    // TODO: exception that sets the http code
    throw new Error(`session already exists for card ${card.id}`);
  }

  const sessionId = await createSession(card.project.worktree);
  const branch =
    card.baseBranch === 'HEAD'
      ? ((await getCheckedOutBranch(card.project.worktree)) ?? 'HEAD')
      : card.baseBranch;
  await patchCard(cardId, {
    sessionId: sessionId,
    baseBranch: branch,
  });
  const prompt = buildPrompt({ ...card, branch });

  await opencodeClient.session.promptAsync({
    body: {
      parts: [
        {
          text: prompt,
          type: 'text',
        },
      ],
    },
    path: { id: sessionId },
    query: { directory: card.project.worktree },
  });
  notifyAgentTaskStarted(card.title);

  return { sessionId };
}

export async function sendMessageToSession({
  message,
  projectId,
  sessionId,
}: SendMessageToSessionData) {
  const { worktree } = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
    select: {
      worktree: true,
    },
  });
  await opencodeClient.session.promptAsync({
    body: {
      parts: [
        {
          text: message,
          type: 'text',
        },
      ],
    },
    path: { id: sessionId },
    query: { directory: worktree },
  });
  return { sessionId };
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
