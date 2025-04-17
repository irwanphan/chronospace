import { useSession } from 'next-auth/react';
import { MenuAccess, ActivityAccess, WorkspaceAccess } from '@/types/access-control';

type AccessType = {
  menuAccess: MenuAccess;
  activityAccess: ActivityAccess;
  workspaceAccess: WorkspaceAccess;
};

export function useUserAccess<T extends keyof AccessType>(
  type: T,
  accessKey: keyof AccessType[T]
): boolean {
  const { data: session } = useSession();
  
  if (!session?.user?.access?.[type]) return false;
  return Boolean(session.user.access[type][accessKey]);
} 