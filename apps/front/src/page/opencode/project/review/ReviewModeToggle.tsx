import { cn } from '#/lib/utils';
import { DiffModeEnum } from '@git-diff-view/react';

export function ReviewModeToggle({
  mode,
  onModeChange,
}: {
  mode: DiffModeEnum;
  onModeChange: (mode: DiffModeEnum) => void;
}) {
  return (
    <div className="flex rounded-lg border border-white/10 bg-gray-800 p-1 text-sm">
      <ModeButton
        active={mode === DiffModeEnum.SplitGitHub}
        onClick={() => onModeChange(DiffModeEnum.SplitGitHub)}
      >
        Split
      </ModeButton>
      <ModeButton
        active={mode === DiffModeEnum.Unified}
        onClick={() => onModeChange(DiffModeEnum.Unified)}
      >
        Unified
      </ModeButton>
    </div>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'cursor-pointer rounded-md px-3 py-1.5',
        active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
