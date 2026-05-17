import { Button } from '#/components/ui/button';

export function LinkedSession({
  disabled,
  isRemoving,
  onRemove,
  sessionId,
}: {
  disabled: boolean;
  isRemoving: boolean;
  onRemove: () => void;
  sessionId?: string;
}) {
  if (sessionId === undefined) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-gray-800/60 p-3 text-sm text-gray-100">
      <div className="min-w-0 space-y-1">
        <span className="block font-medium">Linked session</span>
        <span className="block truncate text-xs text-gray-400">
          {sessionId}
        </span>
      </div>
      <Button
        disabled={disabled}
        onClick={onRemove}
        type="button"
        variant="ghost"
      >
        {isRemoving ? 'Removing...' : 'Remove session'}
      </Button>
    </div>
  );
}
