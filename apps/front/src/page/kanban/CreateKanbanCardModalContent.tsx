import {
  type KanbanCard,
  useCreateKanbanCard,
  useDeleteKanbanCard,
  useUpdateKanbanCard,
} from '#/hooks/queries/kanban/kanban.queries';
import { Button } from '#/components/ui/button';
import { DialogDescription, DialogTitle } from '#/components/ui/dialog';
import { useEffect, useState } from 'react';
import { LinkedSession } from './LinkedSession';
import { MarkdownDescriptionEditor } from './MarkdownDescriptionEditor';
import type { Column } from './kanban.types';

export function CreateKanbanCardModalContent({
  card,
  column,
  onCardCreated,
  onOpenChange,
  projectId,
}: {
  card?: KanbanCard;
  column: Column;
  onCardCreated?: (card: KanbanCard) => void;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [baseBranch, setBaseBranch] = useState(card?.baseBranch ?? 'HEAD');
  const [newBranch, setNewBranch] = useState(card?.newBranch ?? '');
  const { isPending: isCreating, mutate: createCard } =
    useCreateKanbanCard(projectId);
  const { isPending: isUpdating, mutate: updateCard } = useUpdateKanbanCard(
    card?.id ?? '',
  );
  const { isPending: isDeleting, mutate: deleteCard } = useDeleteKanbanCard(
    projectId,
    card?.id ?? '',
  );
  const isEditing = card != null;
  const isPending = isCreating || isUpdating || isDeleting;
  const submitLabel = isPending
    ? isEditing
      ? 'Saving...'
      : 'Creating...'
    : isEditing
      ? 'Save card'
      : 'Create card';

  useEffect(() => {
    const nextDescription = card?.description ?? '';

    setTitle(card?.title ?? '');
    setDescription(nextDescription);
    setBaseBranch(card?.baseBranch ?? 'HEAD');
    setNewBranch(card?.newBranch ?? '');
  }, [card]);

  const handleSubmit = () => {
    if (isPending) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedBaseBranch = baseBranch.trim();
    const trimmedNewBranch = newBranch.trim();

    if (!trimmedTitle || !trimmedBaseBranch) {
      return;
    }

    const nextCard = {
      baseBranch: trimmedBaseBranch,
      column,
      description: trimmedDescription,
      id: card?.id ?? crypto.randomUUID(),
      projectId,
      title: trimmedTitle,
      ...(isEditing ? { newBranch: trimmedNewBranch } : {}),
    };

    const onSuccess = () => {
      setTitle('');
      setDescription('');
      setBaseBranch('HEAD');
      setNewBranch('');
      onOpenChange(false);
    };

    if (isEditing) {
      updateCard(nextCard, { onSuccess });
      return;
    }

    createCard(nextCard, {
      onSuccess(createdCard) {
        onCardCreated?.(createdCard);
        onSuccess();
      },
    });
  };

  const handleClearSession = () => {
    if (!card?.sessionId) {
      return;
    }

    updateCard({ sessionId: null });
  };

  const handleDelete = () => {
    if (!card) {
      return;
    }

    deleteCard(undefined, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <DialogTitle className="text-lg text-white">
          {isEditing ? 'Edit card' : 'Create a card'}
        </DialogTitle>
        <DialogDescription className="text-gray-300">
          {isEditing
            ? `Update this card in the ${column} column.`
            : `Add a new card to the ${column} column.`}
        </DialogDescription>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-gray-100">
          <span>Title</span>
          <input
            autoFocus
            className="w-full rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write a short title"
            value={title}
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-gray-100">
          <span>Description</span>
          <MarkdownDescriptionEditor
            initialValue={description}
            key={card?.id ?? 'new-card'}
            onChange={setDescription}
            onSubmit={handleSubmit}
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-gray-100">
          <span>Base branch</span>
          <input
            className="w-full rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
            onChange={(event) => setBaseBranch(event.target.value)}
            placeholder="HEAD, main, refs/heads/feature..."
            value={baseBranch}
          />
        </label>

        {isEditing && (
          <>
            <label className="block space-y-2 text-sm font-medium text-gray-100">
              <span>Linked branch</span>
              <input
                className="w-full rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
                onChange={(event) => setNewBranch(event.target.value)}
                placeholder="ai/my-branch"
                value={newBranch}
              />
            </label>
            <LinkedSession
              disabled={isPending}
              isRemoving={isUpdating}
              onRemove={handleClearSession}
              sessionId={card?.sessionId ?? undefined}
            />
          </>
        )}
        <div className="flex justify-between gap-2 pt-2">
          {isEditing ? (
            <Button
              disabled={isPending}
              onClick={handleDelete}
              type="button"
              variant="destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete card'}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={!title.trim() || !baseBranch.trim() || isPending}
              type="submit"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
