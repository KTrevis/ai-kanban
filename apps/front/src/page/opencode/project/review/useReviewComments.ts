import { useLocalStorage } from 'usehooks-ts';
import type { Dispatch, SetStateAction } from 'react';
import type { ReviewComment } from './review.utils';

function getReviewCommentsStorageKey(cardId: string) {
  return `review:${cardId}`;
}

function deserializeReviewComments(value: string): ReviewComment[] {
  try {
    const comments = JSON.parse(value) as ReviewComment[];
    return comments.map((comment) => ({
      ...comment,
      date: new Date(comment.date),
    }));
  } catch {
    return [];
  }
}

export function useReviewComments(
  cardId: string,
): [ReviewComment[], Dispatch<SetStateAction<ReviewComment[]>>, () => void] {
  const storageKey = getReviewCommentsStorageKey(cardId);
  const [comments, setComments] = useLocalStorage<ReviewComment[]>(
    storageKey,
    [],
    {
      deserializer: deserializeReviewComments,
    },
  );

  return [
    comments,
    setComments,
    () => window.localStorage.removeItem(storageKey),
  ];
}
