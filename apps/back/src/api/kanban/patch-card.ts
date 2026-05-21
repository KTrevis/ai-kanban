import { prisma } from '../../lib/prisma';
import { KanbanColumn } from '../../generated/prisma/enums';
import { notifyAgentTaskFinished } from '../../lib/notifications';
import { websockets } from '../ws/ws.controller';
import type { UpdateKanbanCard } from './update-card.schema';

export async function patchCard(cardId: string, data: UpdateKanbanCard) {
  const previousCard = await prisma.kanbanCard.findUnique({
    where: { id: cardId },
  });
  const card = await prisma.kanbanCard.update({
    where: { id: cardId },
    data,
  });

  if (
    previousCard?.column !== KanbanColumn.REVIEW &&
    card.column === KanbanColumn.REVIEW
  ) {
    notifyAgentTaskFinished(card.title);
    websockets.sendMessage({
      type: 'cards.updated',
      projectId: card.projectId,
    });
  }

  return card;
}
