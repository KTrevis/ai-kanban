import type { Card } from '#/page/kanban/kanban.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const KANBAN_CARDS_STORAGE_KEY = 'kanban.cards';

export const KANBAN_CARDS_QUERY_KEY = ['kanban', 'cards'] as const;

export function useGetKanbanCards() {
  return useQuery({
    queryFn: getStoredKanbanCards,
    queryKey: KANBAN_CARDS_QUERY_KEY,
  });
}

export function useCreateKanbanCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStoredKanbanCard,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KANBAN_CARDS_QUERY_KEY });
    },
  });
}

function getStoredKanbanCards() {
  const storedCards = localStorage.getItem(KANBAN_CARDS_STORAGE_KEY);

  if (!storedCards) {
    return null;
  }

  try {
    return JSON.parse(storedCards) as Card[];
  } catch {
    return null;
  }
}

async function createStoredKanbanCard(card: Card) {
  const cards = getStoredKanbanCards();
  const newCards: Card[] = [card];

  if (cards) {
    newCards.push(...cards);
  }
  localStorage.setItem(KANBAN_CARDS_STORAGE_KEY, JSON.stringify(newCards));
  return card;
}
