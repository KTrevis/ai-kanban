import { useEden } from '#/lib/eden/client';
import { useQuery } from '@tanstack/react-query';

export type Project = NonNullable<
  ReturnType<typeof useGetProjects>['data']
>[number] & { name?: string };

export const useGetProjects = () => {
  const eden = useEden();
  return useQuery(eden.opencode.projects.get.queryOptions());
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
