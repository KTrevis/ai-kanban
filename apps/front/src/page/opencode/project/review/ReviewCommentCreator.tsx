import { Button } from '#/components/ui/button';
import { useState } from 'react';

export function ReviewCommentCreator({
  onSubmit,
  onClose,
}: {
  onSubmit: (comment: string) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState('');
  const trimmedComment = comment.trim();

  function handleSubmit() {
    if (!trimmedComment) {
      return;
    }

    onClose();
    onSubmit(trimmedComment);
    setComment('');
  }

  return (
    <div className="border-y border-white/10 px-4 py-3">
      <div className="space-y-3">
        <textarea
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              handleSubmit();
            }
          }}
          autoFocus
          className="text-xs min-h-24 w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm !text-white outline-none placeholder:!text-gray-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          onChange={(event) => setComment(event.target.value)}
          placeholder="Add a review comment..."
          value={comment}
        />

        <div className="flex justify-end gap-2">
          <Button
            className="!text-gray-200"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="!text-gray-950"
            disabled={!trimmedComment}
            onClick={handleSubmit}
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
