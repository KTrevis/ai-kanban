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
import type { ReactNode } from 'react';

const modeButtonClass = 'cursor-pointer rounded-md px-3 py-1.5';

export function ReviewHeader({
  canRebase,
  cannotMergeReason,
  checkedOutBranch,
  isCheckingOutBranch,
  isMergingBranch,
  mode,
  newBranch,
  onBack,
  onCheckoutBranch,
  onMergeBranch,
  onModeChange,
  onSendReview,
  baseBranch,
}: {
  canRebase?: boolean;
  cannotMergeReason?: string;
  checkedOutBranch?: string;
  isCheckingOutBranch?: boolean;
  isMergingBranch?: boolean;
  mode: DiffModeEnum;
  newBranch?: string;
  onBack: () => void;
  onCheckoutBranch: () => void;
  onMergeBranch: () => void;
  onModeChange: (mode: DiffModeEnum) => void;
  onSendReview: () => void;
  baseBranch?: string;
}) {
  const isBranchCheckedOut = Boolean(
    newBranch && checkedOutBranch === newBranch,
  );
  const mergeDisabledReason = !newBranch
    ? 'No branch linked to the card'
    : canRebase === false
      ? (cannotMergeReason ?? 'Rebase has conflicts')
      : undefined;
  const mergeButtonDisabled = Boolean(mergeDisabledReason) || isMergingBranch;
  const mergeButton = (
    <Button
      disabled={mergeButtonDisabled}
      onClick={onMergeBranch}
      type="button"
      variant="outline"
    >
      <GitMerge className="size-4" />
      {isMergingBranch ? 'Merging...' : 'Merge'}
    </Button>
  );

  return (
    <header className="border-b border-white/10 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
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
            {mergeDisabledReason ? (
              <DisabledReasonTooltip reason={mergeDisabledReason}>
                {mergeButton}
              </DisabledReasonTooltip>
            ) : (
              mergeButton
            )}
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
  children,
  reason,
}: {
  children: ReactNode;
  reason: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{reason}</TooltipContent>
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
