'use client';

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePageTitleStore } from '@/store/usePageTitleStore'

// Define page configs (copy from middleware.ts)
const pageConfigs: Record<string, { title: string; breadcrumbs: string[] }> = {
  '/user-management': {
    title: 'User Management',
    breadcrumbs: ['Home', 'User Management']
  },
  '/user-management/new': {
    title: 'User Management',
    breadcrumbs: ['Home', 'User Management', 'New']
  },
  '/user-management/[id]/edit': {
    title: 'User Management',
    breadcrumbs: ['Home', 'User Management', 'Edit']
  },
  '/workspace': {
    title: 'Workspace',
    breadcrumbs: ['Home', 'Workspace']
  },
  '/workspace/purchase-request/new': {
    title: 'Purchase Request',
    breadcrumbs: ['Home', 'Workspace', 'New Request']
  },
  '/workspace/purchase-request/[id]': {
    title: 'Purchase Request',
    breadcrumbs: ['Home', 'Workspace', 'Request Detail']
  },
  '/budget-planning': {
    title: 'Budget Planning',
    breadcrumbs: ['Home', 'Budget Planning']
  },
  '/budget-planning/new': {
    title: 'Budget Planning',
    breadcrumbs: ['Home', 'Budget Planning', 'New']
  },
  '/budget-planning/[id]/edit': {
    title: 'Budget Planning',
    breadcrumbs: ['Home', 'Budget Planning', 'Edit']
  },
  '/project-planning': {
    title: 'Project Planning',
    breadcrumbs: ['Home', 'Project Planning']
  },
  '/project-planning/new': {
    title: 'Project Planning',
    breadcrumbs: ['Home', 'Project Planning', 'New']
  },
  '/project-planning/[id]/edit': {
    title: 'Project Planning',
    breadcrumbs: ['Home', 'Project Planning', 'Edit']
  },
  '/timeline': {
    title: 'Workspace Updates',
    breadcrumbs: ['Home', 'Workspace Updates']
  },
  '/workspace-management/work-division': {
    title: 'Workspace Management',
    breadcrumbs: ['Home', 'Workspace Management', 'Work Division']
  },
  '/workspace-management/vendors': {
    title: 'Workspace Management',
    breadcrumbs: ['Home', 'Workspace Management', 'Vendors']
  },
  '/workspace-management/role': {
    title: 'Workspace Management',
    breadcrumbs: ['Home', 'Workspace Management', 'Role']
  },
  '/workspace-management/approval-schema': {
    title: 'Workspace Management',
    breadcrumbs: ['Home', 'Workspace Management', 'Approval Schema']
  },
  
};

export function usePageTitle() {
  const pathname = usePathname();
  const setPage = usePageTitleStore(state => state.setPage)

  useEffect(() => {
    // Convert dynamic path segments to [id] format
    const normalizedPath = pathname.replace(/\/[0-9a-fA-F-]+(?=\/|$)/g, '/[id]');
    
    // Find exact match first, then try to find parent path
    let pageConfig = pageConfigs[normalizedPath];
    if (!pageConfig) {
      // Try to find parent path
      const parentPath = Object.keys(pageConfigs).find(path => normalizedPath.startsWith(path));
      pageConfig = parentPath ? pageConfigs[parentPath] : {
        title: 'Dashboard',
        breadcrumbs: ['Home']
      };
    }

    setPage(pageConfig.title, pageConfig.breadcrumbs)
  }, [pathname, setPage])
} 