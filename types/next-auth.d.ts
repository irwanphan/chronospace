import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      access: {
        menuAccess: {
          timeline: boolean;
          workspace: boolean;
          projectPlanning: boolean;
          budgetPlanning: boolean;
          userManagement: boolean;
          workspaceManagement: boolean;
        };
      };
    } & DefaultSession['user'];
  }
} 