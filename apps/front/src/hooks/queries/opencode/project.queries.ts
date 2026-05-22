import { useEden } from '#/lib/eden/client';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type Project = NonNullable<
  ReturnType<typeof useGetProjects>['data']
>[number] & { name?: string };

export const useGetProjects = () => {
  const eden = useEden();
  return useQuery(eden.projects.get.queryOptions());
};

export const useGetProjectCheckedOutBranch = (projectId?: string) => {
  const eden = useEden();

  return useQuery({
    ...eden.projects({ projectId: projectId ?? '' })['checked-out-branch'].get.queryOptions(),
    enabled: Boolean(projectId),
  });
};

export const useCreateProject = () => {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation(
    eden.projects.post.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(eden.projects.get.queryOptions());
      },
    }),
  );
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
