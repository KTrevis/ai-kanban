import type { Card } from './kanban.types';

export function KanbanCard({
  card,
  isOverlay,
  onClick,
}: {
  card: Card;
  isOverlay?: boolean;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className={`cursor-grab rounded-xl border border-white/10 bg-gray-800 p-4 shadow-lg shadow-black/20 active:cursor-grabbing ${
        isOverlay ? 'rotate-2 ring-2 ring-cyan-300' : ''
      }`}
    >
      <h3 className="font-medium text-gray-50">{card.title}</h3>
      <p className="mt-2 text-sm leading-5 text-gray-400">{card.description}</p>
    </article>
  );
}
