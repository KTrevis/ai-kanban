import { AutoCompleteCard } from '#/components/opencode/AutocompleteCard';
import { useEffect, useRef, useState } from 'react';

export function AutoComplete({
  onSelect,
  suggestions,
}: {
  onSelect: (suggestion: string) => void;
  suggestions: string[];
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  useEffect(() => {
    const selectedElement = listRef.current?.querySelector('[data-selected]');
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!suggestions.length) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % suggestions.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(
          (current) => (current - 1 + suggestions.length) % suggestions.length,
        );
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        onSelect(suggestions[selectedIndex] ?? suggestions[0]);
      }
    }

    document.addEventListener('keydown', onKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [onSelect, selectedIndex, suggestions]);

  if (!suggestions.length) {
    return;
  }

  return (
    <div
      className="absolute right-4 bottom-full left-4 z-50 mb-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-gray-950/95 p-2 shadow-2xl"
      ref={listRef}
    >
      {suggestions.map((curr, index) => (
        <button
          className={`block w-full rounded px-2 text-left cursor-pointer ${
            index === selectedIndex
              ? 'bg-white/10 text-cyan-300'
              : 'text-white hover:bg-white/5'
          }`}
          data-selected={index === selectedIndex || undefined}
          key={curr}
          onClick={() => onSelect(curr)}
          type="button"
        >
          <AutoCompleteCard name={curr} />
        </button>
      ))}
    </div>
  );
}
