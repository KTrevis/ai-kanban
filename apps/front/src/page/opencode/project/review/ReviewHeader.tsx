import { Button } from '#/components/ui/button';
import { cn } from '#/lib/utils';
import { DiffModeEnum } from '@git-diff-view/react';
import { Link } from '@tanstack/react-router';

const modeButtonClass = 'cursor-pointer rounded-md px-3 py-1.5';

export function ReviewHeader({
  baseBranch,
  mode,
  newBranch,
  onModeChange,
  onSendReview,
  projectId,
}: {
  baseBranch?: string;
  mode: DiffModeEnum;
  newBranch?: string;
  onModeChange: (mode: DiffModeEnum) => void;
  onSendReview: () => void;
  projectId: string;
}) {
  return (
    <header className="border-b border-white/10 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/project/$id"
            params={{ id: projectId }}
            className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
          >
            Back to board
          </Link>
          <h1 className="mt-2 truncate text-xl font-semibold text-white">
            Review changes
          </h1>
          {baseBranch && newBranch ? (
            <p className="mt-1 text-sm text-gray-400">
              {baseBranch}...{newBranch}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button onClick={onSendReview} type="button">
            Send Review
          </Button>
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
        </div>
      </div>
    </header>
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
        modeButtonClass,
        active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
