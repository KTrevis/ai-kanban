import { useEffect, useLayoutEffect, useRef } from 'react';

type AppEventPayloads = {
  'opencode.session.idle': { sessionId: string };
};

type AppEventType = keyof AppEventPayloads;

export function dispatchAppEvent<T extends AppEventType>(
  type: T,
  detail: AppEventPayloads[T],
) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

export function useAppEvent<T extends AppEventType>(
  type: T,
  handler: (detail: AppEventPayloads[T]) => void,
) {
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    function onEvent(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      handlerRef.current(event.detail);
    }

    window.addEventListener(type, onEvent);
    return () => {
      window.removeEventListener(type, onEvent);
    };
  }, [type]);
}
