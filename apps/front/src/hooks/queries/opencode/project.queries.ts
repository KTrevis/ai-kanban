import { useEden } from '#/lib/eden/client';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const HIDDEN_PROJECTS_STORAGE_KEY = 'travaille.hiddenProjects';
const hiddenProjectIdsQueryKey = ['opencode', 'hidden-project-ids'] as const;

function readHiddenProjectIds() {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const value = window.localStorage.getItem(HIDDEN_PROJECTS_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];

    return Array.isArray(parsed)
      ? parsed.filter(
          (projectId): projectId is string => typeof projectId === 'string',
        )
      : [];
  } catch {
    return [] as string[];
  }
}

function writeHiddenProjectIds(projectIds: Array<string>) {
  window.localStorage.setItem(
    HIDDEN_PROJECTS_STORAGE_KEY,
    JSON.stringify(projectIds),
  );

  return projectIds;
}

export type Project = NonNullable<
  ReturnType<typeof useGetProjects>['data']
>[number] & { name?: string };

export const useGetProjects = () => {
  const eden = useEden();
  return useQuery(eden.opencode.projects.get.queryOptions());
};

export const useGetHiddenProjectIds = () => {
  return useQuery({
    queryKey: hiddenProjectIdsQueryKey,
    queryFn: readHiddenProjectIds,
  });
};

export const useUpdateHiddenProjectIds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: writeHiddenProjectIds,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: hiddenProjectIdsQueryKey });
    },
  });
};

export type Session = NonNullable<
  NonNullable<ReturnType<typeof useGetProjectById>['data']>['sessions']
>[number];

export const useGetProjectById = (id: string) => {
  const eden = useEden();
  return useQuery(eden.opencode.project({ id }).get.queryOptions());
};

export type Command = NonNullable<
  ReturnType<typeof useGetProjectCommands>['data']
>['commands'][number];

export const useGetProjectCommands = (id: string) => {
  const eden = useEden();
  return useQuery(eden.opencode.project({ id }).commands.get.queryOptions());
};

export const useGetProjectFiles = (id: string, q: string, enabled: boolean) => {
  const eden = useEden();

  return useQuery({
    ...eden.opencode.project({ id }).files.get.queryOptions({ q }),
    enabled,
    placeholderData: keepPreviousData,
  });
};
