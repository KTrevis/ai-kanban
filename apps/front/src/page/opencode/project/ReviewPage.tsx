import { useGetKanbanCardReview } from '#/hooks/queries/kanban/kanban.queries';
import { DiffModeEnum, DiffView } from '@git-diff-view/react';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

type DiffFilePatch = {
  filename: string;
  patch: string;
};

export function ReviewPage({
  cardId,
  projectId,
}: {
  cardId: string;
  projectId: string;
}) {
  const { data, error, isLoading } = useGetKanbanCardReview(cardId);
  const [mode, setMode] = useState<DiffModeEnum>(DiffModeEnum.SplitGitHub);
  const files = useMemo(() => splitGitDiff(data?.diff ?? ''), [data?.diff]);

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col text-gray-100">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/project/$id"
              params={{ id: projectId }}
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              Back to board
            </Link>
            <h1 className="mt-2 truncate text-xl font-semibold text-white">
              Review changes
            </h1>
            {data ? (
              <p className="mt-1 text-sm text-gray-400">
                {data.baseBranch}...{data.newBranch}
              </p>
            ) : null}
          </div>
          <div className="flex rounded-lg border border-white/10 bg-gray-800 p-1 text-sm">
            <button
              className={`rounded-md px-3 py-1.5 cursor-pointer ${
                mode === DiffModeEnum.SplitGitHub
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setMode(DiffModeEnum.SplitGitHub)}
              type="button"
            >
              Split
            </button>
            <button
              className={`rounded-md px-3 py-1.5 cursor-pointer ${
                mode === DiffModeEnum.Unified
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setMode(DiffModeEnum.Unified)}
              type="button"
            >
              Unified
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {isLoading ? (
          <StateMessage title="Loading diff" />
        ) : error ? (
          <StateMessage
            title="Unable to load diff"
            detail={getErrorMessage(error)}
          />
        ) : data?.isEmpty ? (
          <StateMessage
            title="No committed diff"
            detail="This branch has no changes against its base branch."
          />
        ) : (
          <div className="space-y-6">
            {files.map((file) => (
              <article
                className="overflow-hidden rounded-xl border border-white/10 bg-gray-900"
                key={file.filename}
              >
                <div className="border-b border-white/10 px-4 py-3 font-mono text-sm text-gray-200">
                  {file.filename}
                </div>
                <DiffView
                  data={{
                    newFile: { fileName: file.filename },
                    oldFile: { fileName: file.filename },
                    hunks: [file.patch],
                  }}
                  diffViewFontSize={13}
                  diffViewHighlight
                  diffViewMode={mode}
                  diffViewTheme="dark"
                  diffViewWrap
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StateMessage({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {detail ? <p className="mt-2 text-sm text-gray-400">{detail}</p> : null}
      </div>
    </div>
  );
}

function splitGitDiff(diff: string): DiffFilePatch[] {
  return diff
    .split(/(?=^diff --git )/m)
    .map((patch) => patch.trimEnd())
    .filter(Boolean)
    .map((patch) => ({
      filename: getDiffFilename(patch),
      patch,
    }));
}

function getDiffFilename(patch: string) {
  const header = patch.match(/^diff --git a\/(.*?) b\/(.*)$/m);
  return header?.[2] ?? 'unknown file';
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}
