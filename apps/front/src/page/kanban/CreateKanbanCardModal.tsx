import { Modal } from '#/components/Modal';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Column } from './kanban.types';
import { CreateKanbanCardModalContent } from './CreateKanbanCardModalContent';

export function CreateKanbanCardDialog({
  column,
  projectId,
}: {
  column: Column;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Plus className="cursor-pointer" onClick={() => setOpen(true)} />
      <Modal open={open} onOpenChange={setOpen}>
        <CreateKanbanCardModalContent
          column={column}
          onOpenChange={setOpen}
          projectId={projectId}
        />
      </Modal>
    </div>
  );
}
