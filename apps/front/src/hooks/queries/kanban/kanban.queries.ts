import type { Card } from '#/page/kanban/kanban.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const kanbanCardsQueryKey = (projectId: string) =>
  ['kanban', 'cards', projectId] as const;

export function useGetKanbanCards(projectId: string) {
  return useQuery({
    queryFn: () => getStoredKanbanCards(projectId),
    queryKey: kanbanCardsQueryKey(projectId),
  });
}

export function useCreateKanbanCard(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (card: Card) => createStoredKanbanCard(projectId, card),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: kanbanCardsQueryKey(projectId),
      });
    },
  });
}

export function useUpdateKanbanCard(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (card: Card) => updateStoredKanbanCard(projectId, card),
    onSuccess: (card) => {
      queryClient.setQueryData<Card[]>(kanbanCardsQueryKey(projectId), (cards) =>
        cards?.map((currentCard) =>
          currentCard.id === card.id ? card : currentCard,
        ),
      );
    },
  });
}

export function setStoredKanbanCards(projectId: string, cards: Card[]) {
  localStorage.setItem(
    getKanbanCardsStorageKey(projectId),
    JSON.stringify(cards),
  );
}

function getKanbanCardsStorageKey(projectId: string) {
  return `kanban.cards.${projectId}`;
}

function getStoredKanbanCards(projectId: string) {
  const storedCards = localStorage.getItem(getKanbanCardsStorageKey(projectId));

  if (!storedCards) {
    return [];
  }

  try {
    return JSON.parse(storedCards) as Card[];
  } catch {
    return [];
  }
}

async function createStoredKanbanCard(projectId: string, card: Card) {
  const cards = getStoredKanbanCards(projectId);
  const newCards: Card[] = [...cards, card];
  setStoredKanbanCards(projectId, newCards);
  return card;
}

async function updateStoredKanbanCard(projectId: string, card: Card) {
  const cards = getStoredKanbanCards(projectId);
  const newCards = cards.map((currentCard) =>
    currentCard.id === card.id ? card : currentCard,
  );
  setStoredKanbanCards(projectId, newCards);
  return card;
}
