import { Button } from '#/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';
import { DiffModeEnum } from '@git-diff-view/react';
import { Copy, GitBranch, GitMerge } from 'lucide-react';

export function ReviewHeader({
  checkedOutBranch,
  isCheckingOutBranch,
  mode,
  newBranch,
  onCheckoutBranch,
  onMergeBranch,
  onModeChange,
  onSendReview,
  baseBranch,
  canRebase,
}: {
  checkedOutBranch?: string;
  isCheckingOutBranch?: boolean;
  mode: DiffModeEnum;
  newBranch?: string;
  onCheckoutBranch: () => void;
  onMergeBranch: () => void;
  onModeChange: (mode: DiffModeEnum) => void;
  onSendReview: () => void;
  baseBranch?: string;
  canRebase: boolean;
}) {
  const isBranchCheckedOut = Boolean(
    newBranch && checkedOutBranch === newBranch,
  );

  return (
    <header className="border-b border-white/10 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="cursor-pointer text-sm font-medium text-cyan-300 hover:text-cyan-200"
          >
            Back
          </button>
          <h1 className="mt-2 truncate text-xl font-semibold text-white">
            Review changes
          </h1>
          <div
            className="flex cursor-pointer items-center gap-2 text-sm text-gray-400"
            onClick={() =>
              newBranch && navigator.clipboard.writeText(newBranch)
            }
          >
            {baseBranch && `${baseBranch} <=`} {newBranch}{' '}
            <Copy className="size-4" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
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
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              disabled={!newBranch || isBranchCheckedOut || isCheckingOutBranch}
              onClick={onCheckoutBranch}
              type="button"
              variant="outline"
            >
              <GitBranch className="size-4" />
              {isCheckingOutBranch
                ? 'Checking out...'
                : isBranchCheckedOut
                  ? 'Branch checked out'
                  : 'Checkout branch'}
            </Button>
            <DisabledReasonTooltip
              disabled={canRebase}
              onMergeBranch={onMergeBranch}
            />
            <Button onClick={onSendReview} type="button">
              Send Review
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function DisabledReasonTooltip({
  disabled,
  onMergeBranch,
}: {
  disabled: boolean;
  onMergeBranch: () => void;
}) {
  if (disabled) {
    return (
      <Button onClick={onMergeBranch} type="button" variant="outline">
        <GitMerge className="size-4" />
        Merge
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>
            <Button disabled type="button" variant="outline">
              <GitMerge className="size-4" />
              Merge
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          Cannot merge, conflicts between branches
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
