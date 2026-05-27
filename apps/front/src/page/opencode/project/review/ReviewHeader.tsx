import { DiffModeEnum } from '@git-diff-view/react';
import { ReviewHeaderActions } from './ReviewHeaderActions';
import { ReviewHeaderTitle } from './ReviewHeaderTitle';
import { ReviewModeToggle } from './ReviewModeToggle';

export function ReviewHeader({
  actions,
  branch,
  diffMode,
}: {
  actions: {
    onCheckoutBranch: () => void;
    onMergeBranch: () => void;
    onSendReview: () => void;
  };
  branch: {
    baseBranch?: string;
    canMerge: boolean;
    cannotMergeReason?: string;
    checkedOutBranch?: string;
    isCheckingOut: boolean;
    newBranch?: string;
  };
  diffMode: {
    value: DiffModeEnum;
    onChange: (mode: DiffModeEnum) => void;
  };
}) {
  return (
    <header className="border-b border-white/10 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ReviewHeaderTitle
          baseBranch={branch.baseBranch}
          newBranch={branch.newBranch}
        />

        <div className="flex flex-col items-end gap-2">
          <ReviewModeToggle
            mode={diffMode.value}
            onModeChange={diffMode.onChange}
          />
          <ReviewHeaderActions
            canMerge={branch.canMerge}
            cannotMergeReason={branch.cannotMergeReason}
            checkedOutBranch={branch.checkedOutBranch}
            isCheckingOutBranch={branch.isCheckingOut}
            newBranch={branch.newBranch}
            onCheckoutBranch={actions.onCheckoutBranch}
            onMergeBranch={actions.onMergeBranch}
            onSendReview={actions.onSendReview}
          />
        </div>
      </div>
    </header>
  );
}
