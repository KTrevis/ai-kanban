import { Modal } from '#/components/Modal';
import type { KanbanCard } from '#/hooks/queries/kanban/kanban.queries';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Column } from './kanban.types';
import { CreateKanbanCardModalContent } from './CreateKanbanCardModalContent';

export function CreateKanbanCardDialog({
  column,
  onCardCreated,
  projectId,
}: {
  column: Column;
  onCardCreated?: (card: KanbanCard) => void;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Plus className="cursor-pointer" onClick={() => setOpen(true)} />
      <Modal open={open} onOpenChange={setOpen}>
        <CreateKanbanCardModalContent
          column={column}
          onCardCreated={onCardCreated}
          onOpenChange={setOpen}
          projectId={projectId}
        />
      </Modal>
    </div>
  );
}
