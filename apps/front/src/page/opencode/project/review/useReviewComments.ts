import { useEffect, useRef, useState } from 'react';
import type { ReviewComment } from './review.utils';

function getReviewCommentsStorageKey(cardId: string) {
  return `review:${cardId}`;
}

function loadReviewComments(cardId: string): ReviewComment[] {
  try {
    const storedComments = window.localStorage.getItem(
      getReviewCommentsStorageKey(cardId),
    );

    if (!storedComments) {
      return [];
    }

    const comments = JSON.parse(storedComments) as ReviewComment[];
    return comments.map((comment) => ({
      ...comment,
      date: new Date(comment.date),
    }));
  } catch {
    return [];
  }
}

export function useReviewComments(cardId: string) {
  const hasLoadedCardComments = useRef(true);
  const [comments, setComments] = useState<ReviewComment[]>(() =>
    loadReviewComments(cardId),
  );

  useEffect(() => {
    hasLoadedCardComments.current = false;
    setComments(loadReviewComments(cardId));
  }, [cardId]);

  useEffect(() => {
    if (!hasLoadedCardComments.current) {
      hasLoadedCardComments.current = true;
      return;
    }

    try {
      window.localStorage.setItem(
        getReviewCommentsStorageKey(cardId),
        JSON.stringify(comments),
      );
    } catch {
      // Ignore storage failures so review comments still work in memory.
    }
  }, [cardId, comments]);

  return [comments, setComments] as const;
}
