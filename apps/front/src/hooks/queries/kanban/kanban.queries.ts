import { useEden } from '#/lib/eden/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetKanbanCards(projectId: string) {
  const eden = useEden();
  return useQuery(eden.kanban.cards({ projectId }).get.queryOptions());
}

export type KanbanCards = NonNullable<
  ReturnType<typeof useGetKanbanCards>['data']
>;

export type KanbanCard = KanbanCards[number];

export type KanbanColumn = KanbanCard['column'];

export function useCreateKanbanCard(projectId: string) {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation(
    eden.kanban.card.post.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          eden.kanban.cards({ projectId }).get.queryOptions(),
        );
      },
    }),
  );
}

export function useMoveKanbanCards(projectId: string) {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation(
    eden.kanban.cards.patch.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          eden.kanban.cards({ projectId }).get.queryOptions(),
        );
      },
    }),
  );
}

export function useUpdateKanbanCard(cardId: string) {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation(
    eden.kanban.card({ cardId }).patch.mutationOptions({
      onSuccess(card) {
        queryClient.invalidateQueries(
          eden.kanban.cards({ projectId: card.projectId }).get.queryOptions(),
        );
      },
    }),
  );
}

export function useDeleteKanbanCard(projectId: string, cardId: string) {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation(
    eden.kanban.card({ cardId }).delete.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          eden.kanban.cards({ projectId }).get.queryOptions(),
        );
      },
    }),
  );
}
