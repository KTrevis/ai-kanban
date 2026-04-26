import {
  useCreateKanbanCard,
  useUpdateKanbanCard,
} from '#/hooks/queries/kanban/kanban.queries';
import { Button } from '#/components/ui/button';
import { DialogDescription, DialogTitle } from '#/components/ui/dialog';
import { useEffect, useState, type SubmitEventHandler } from 'react';
import type { Card, Column } from './kanban.types';

export function CreateKanbanCardModalContent({
  card,
  column,
  onOpenChange,
  projectId,
}: {
  card?: Card;
  column: Column;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const { isPending: isCreating, mutate: createCard } =
    useCreateKanbanCard(projectId);
  const { isPending: isUpdating, mutate: updateCard } =
    useUpdateKanbanCard(projectId);
  const isEditing = card != null;
  const isPending = isCreating || isUpdating;
  const submitLabel = isPending
    ? isEditing
      ? 'Saving...'
      : 'Creating...'
    : isEditing
      ? 'Save card'
      : 'Create card';

  useEffect(() => {
    setTitle(card?.title ?? '');
    setDescription(card?.description ?? '');
  }, [card]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    const nextCard = {
      column,
      description: trimmedDescription,
      id: card?.id ?? crypto.randomUUID(),
      title: trimmedTitle,
    };

    const onSuccess = () => {
      setTitle('');
      setDescription('');
      onOpenChange(false);
    };

    if (isEditing) {
      updateCard(nextCard, { onSuccess });
      return;
    }

    createCard(nextCard, { onSuccess });
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

      <form className="space-y-4" onSubmit={handleSubmit}>
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
          <textarea
            className="min-h-24 w-full resize-none rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a bit of context"
            value={description}
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button disabled={!title.trim() || isPending} type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
