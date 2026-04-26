import type { Card } from './kanban.types';

export const initialCards: Card[] = [
  {
    id: 'task-1',
    title: 'Lister les besoins',
    description: 'Clarifier ce qui doit aller dans le board.',
    column: 'TODO',
  },
  {
    id: 'task-2',
    title: 'Faire un prototype',
    description: 'Créer les colonnes et le drag & drop.',
    column: 'AI',
  },
  {
    id: 'task-3',
    title: 'Relire le flow',
    description: 'Vérifier que le déplacement est naturel.',
    column: 'Review',
  },
  {
    id: 'task-4',
    title: 'Brancher /kanban',
    description: 'Ajouter la route dans TanStack Router.',
    column: 'Done',
  },
];
