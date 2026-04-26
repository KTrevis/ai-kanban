import { useCreateKanbanCard } from '#/hooks/queries/kanban/kanban.queries';
import { Button } from '#/components/ui/button';
import { DialogDescription, DialogTitle } from '#/components/ui/dialog';
import { useState, type SubmitEventHandler } from 'react';
import type { Column } from './kanban.types';

export function CreateKanbanCardModalContent({
  column,
  onOpenChange,
}: {
  column: Column;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { isPending, mutate: createCard } = useCreateKanbanCard();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    createCard(
      {
        column,
        description: trimmedDescription,
        id: crypto.randomUUID(),
        title: trimmedTitle,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <DialogTitle className="text-lg text-white">Create a card</DialogTitle>
        <DialogDescription className="text-gray-300">
          Add a new card to the {column} column.
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
          <Button
            disabled={!title.trim() || isPending}
            type="submit"
          >
            {isPending ? 'Creating...' : 'Create card'}
          </Button>
        </div>
      </form>
    </div>
  );
}
