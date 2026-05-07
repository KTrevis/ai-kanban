import type { ReactNode } from 'react';
import { Dialog, DialogContent } from './ui/dialog';

export function Modal({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-700 text-white border border-white sm:max-w-2xl">
        {children}
      </DialogContent>
    </Dialog>
  );
}
