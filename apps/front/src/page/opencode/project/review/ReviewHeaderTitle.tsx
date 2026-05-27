import { cn } from '#/lib/utils';
import { Copy } from 'lucide-react';

export function ReviewHeaderTitle({
  baseBranch,
  newBranch,
}: {
  baseBranch?: string;
  newBranch?: string;
}) {
  const branchLabel = [baseBranch && `${baseBranch} <=`, newBranch]
    .filter(Boolean)
    .join(' ');

  return (
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
        className={cn(
          'flex items-center gap-2 text-sm text-gray-400',
          newBranch && 'cursor-pointer',
        )}
        onClick={() =>
          newBranch && void navigator.clipboard.writeText(newBranch)
        }
      >
        {branchLabel} {newBranch && <Copy className="size-4" />}
      </div>
    </div>
  );
}
