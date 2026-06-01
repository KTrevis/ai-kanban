import { ProjectList } from '#/components/opencode/ProjectList';
import {
  useCreateCardSession,
  useCreateProjectSession,
} from '#/hooks/mutations/opencode/session.mutations';
import {
  type KanbanCard,
  useGetKanbanCards,
  useMoveKanbanCards,
} from '#/hooks/mutations/kanban/kanban.mutations';
import { useGetProjects } from '#/hooks/queries/opencode/project.queries';
import { getOpencodeSessionUrl } from '#/lib/opencode-session-url';
import type { CardMovedEvent } from '#/page/kanban/KanbanPage';
import { useEffect } from 'react';
import { ProjectContent } from './ProjectContent';

export function ProjectPage({
  cardId,
  onCardIdChange,
  projectId,
}: {
  cardId?: string;
  onCardIdChange: (cardId?: string) => void;
  projectId: string;
}) {
  const { data: cards } = useGetKanbanCards(projectId);
  const { data: projects = [] } = useGetProjects();
  const { mutate: moveCards } = useMoveKanbanCards(projectId);
  const { mutate: createCardSession } = useCreateCardSession();
  const { isPending: isCreatingProjectSession, mutate: createProjectSession } =
    useCreateProjectSession();
  const project = projects.find((project) => project.id === projectId);
  const projectFirstChar = Array.from(project?.name ?? '')[0];

  useEffect(() => {
    document.title = projectFirstChar
      ? `${projectFirstChar} - Kanban`
      : 'Travaille - Kanban';
  }, [projectFirstChar]);

  function openSession(sessionId: string, targetWindow?: Window | null) {
    if (!project) {
      return;
    }

    const sessionUrl = getOpencodeSessionUrl({
      projectDirectory: project.worktree,
      sessionId,
    });

    if (targetWindow) {
      targetWindow.opener = null;
      targetWindow.location.href = sessionUrl;
      return;
    }

    window.open(sessionUrl, '_blank', 'noopener,noreferrer');
  }

  function startProjectSession() {
    if (!project) {
      return;
    }

    const sessionWindow = window.open('about:blank', '_blank');

    createProjectSession(
      { projectId },
      {
        onError() {
          sessionWindow?.close();
        },
        onSuccess(result) {
          if ('sessionId' in result && result.sessionId) {
            openSession(result.sessionId, sessionWindow);
            return;
          }

          sessionWindow?.close();
        },
      },
    );
  }

  function onCardMoved({ card, cards }: CardMovedEvent) {
    if (card.column === 'AI') {
      createCardSession({ cardId: card.id });
    }
    moveCards(
      cards.map((card, position) => ({
        column: card.column,
        id: card.id,
        position,
        projectId: card.projectId,
      })),
    );
  }

  function onCardCreated(card: KanbanCard) {
    if (card.column === 'AI') {
      createCardSession({ cardId: card.id });
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <ProjectList selectedProject={projectId} />
      <ProjectContent
        cards={cards ?? []}
        cardId={cardId}
        isProjectSessionStarting={isCreatingProjectSession}
        projectId={projectId}
        projectWorktree={project?.worktree}
        onCardCreated={onCardCreated}
        onCardIdChange={onCardIdChange}
        onCardMoved={onCardMoved}
        onProjectSessionStart={startProjectSession}
      />
    </div>
  );
}
