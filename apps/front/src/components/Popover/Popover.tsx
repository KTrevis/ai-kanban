import {
  Popover as BasePopover,
  PopoverContent,
} from '@/components/ui/popover';
import type { ReactNode } from 'react';

export function Popover({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <BasePopover open={open}>
      <PopoverContent>{children}</PopoverContent>
    </BasePopover>
  );
}
