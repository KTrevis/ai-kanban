import { Button } from '#/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip';
import { GitBranch, GitMerge } from 'lucide-react';

export function ReviewHeaderActions({
  canMerge,
  cannotMergeReason,
  checkedOutBranch,
  isCheckingOutBranch,
  newBranch,
  onCheckoutBranch,
  onMergeBranch,
  onSendReview,
}: {
  canMerge: boolean;
  cannotMergeReason?: string;
  checkedOutBranch?: string;
  isCheckingOutBranch?: boolean;
  newBranch?: string;
  onCheckoutBranch: () => void;
  onMergeBranch: () => void;
  onSendReview: () => void;
}) {
  const isBranchCheckedOut = Boolean(
    newBranch && checkedOutBranch === newBranch,
  );

  return (
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
      <MergeButton
        canMerge={canMerge}
        cannotMergeReason={cannotMergeReason}
        onMergeBranch={onMergeBranch}
      />
      <Button onClick={onSendReview} type="button">
        Send Review
      </Button>
    </div>
  );
}

function MergeButton({
  canMerge,
  cannotMergeReason,
  onMergeBranch,
}: {
  canMerge: boolean;
  cannotMergeReason?: string;
  onMergeBranch: () => void;
}) {
  if (canMerge) {
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
          {cannotMergeReason ?? 'Cannot merge, conflicts between branches'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
