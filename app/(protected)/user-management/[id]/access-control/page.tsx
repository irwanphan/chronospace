'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuAccess {
  timeline: boolean;
  workspace: boolean;
  projectPlanning: boolean;
  budgetPlanning: boolean;
  userManagement: boolean;
  workspaceManagement: boolean;
}

interface ActivityAccess {
  createProject: boolean;
  editProject: boolean;
  deleteProject: boolean;

  createBudget: boolean;
  editBudget: boolean;
  deleteBudget: boolean;

  createWorkDivision: boolean;
  editWorkDivision: boolean;
  deleteWorkDivision: boolean;

  createRole: boolean;
  editRole: boolean;
  deleteRole: boolean;

  createVendor: boolean;
  editVendor: boolean;
  deleteVendor: boolean;

  createApprovalSchema: boolean;
  editApprovalSchema: boolean;
  deleteApprovalSchema: boolean;

  createUser: boolean;
  editUser: boolean;
  deleteUser: boolean;
}

interface WorkspaceAccess {
  createPurchaseRequest: boolean;
  reviewApprovePurchaseRequest: boolean;
}

interface AccessControl {
  menuAccess: MenuAccess;
  activityAccess: ActivityAccess;
  workspaceAccess: WorkspaceAccess;
}

const MENU_ACCESS_ORDER = [
  'timeline',
  'workspace',
  'projectPlanning',
  'budgetPlanning',
  'userManagement',
  'workspaceManagement'
] as const;

const ACTIVITY_ACCESS_ORDER = [
  // Project Management
  'createProject',
  'editProject',
  'deleteProject',

  // Budget Management
  'createBudget',
  'editBudget',
  'deleteBudget',

  // Work Division
  'createWorkDivision',
  'editWorkDivision',
  'deleteWorkDivision',

  // Role Management
  'createRole',
  'editRole',
  'deleteRole',

  // Vendor Management
  'createVendor',
  'editVendor',
  'deleteVendor',

  // Approval Schema
  'createApprovalSchema',
  'editApprovalSchema',
  'deleteApprovalSchema',

  // User Management
  'createUser',
  'editUser',
  'deleteUser'
] as const;

const WORKSPACE_ACCESS_ORDER = [
  'createPurchaseRequest',
  'reviewApprovePurchaseRequest'
] as const;

export default function UserAccessControlPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [access, setAccess] = useState<AccessControl>({
    menuAccess: {
      timeline: false,
      workspace: false,
      projectPlanning: false,
      budgetPlanning: false,
      userManagement: false,
      workspaceManagement: false
    },
    activityAccess: {
      createProject: false,
      editProject: false,
      deleteProject: false,
      createBudget: false,
      editBudget: false,
      deleteBudget: false,
      createWorkDivision: false,
      editWorkDivision: false,
      deleteWorkDivision: false,
      createRole: false,
      editRole: false,
      deleteRole: false,
      createVendor: false,
      editVendor: false,
      deleteVendor: false,
      createApprovalSchema: false,
      editApprovalSchema: false,
      deleteApprovalSchema: false,
      createUser: false,
      editUser: false,
      deleteUser: false
    },
    workspaceAccess: {
      createPurchaseRequest: false,
      reviewApprovePurchaseRequest: false
    }
  });

  useEffect(() => {
    const fetchUserAccess = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}/access`);
        if (!response.ok) throw new Error('Failed to fetch access');
        const data = await response.json();
        setAccess(data);
      } catch (error) {
        console.error('Error fetching access:', error);
      }
    };

    fetchUserAccess();
  }, [params.id]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}/access`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(access),
      });

      if (!response.ok) throw new Error('Failed to update access control');

      router.push('/user-management');
    } catch (error) {
      console.error('Error updating access control:', error);
    }
  };

  const handleMenuAccessChange = (key: string, value: boolean) => {
    setAccess({
      ...access,
      menuAccess: {
        ...access.menuAccess,
        [key]: value
      }
    });
  };

  const handleActivityAccessChange = (key: string, value: boolean) => {
    setAccess({
      ...access,
      activityAccess: {
        ...access.activityAccess,
        [key]: value
      }
    });
  };

  const handleWorkspaceAccessChange = (key: string, value: boolean) => {
    setAccess({
      ...access,
      workspaceAccess: {
        ...access.workspaceAccess,
        [key]: value
      }
    });
  };

  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">User Access Control</h1>
      
      {/* Menu Access */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Menu Access</h2>
        <div className="grid grid-cols-1 gap-3">
          {MENU_ACCESS_ORDER.map((key) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={access.menuAccess[key]}
                onChange={(e) => handleMenuAccessChange(key, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{formatLabel(key)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Activity Access */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Activity Access</h2>
        <div className="grid grid-cols-3 gap-3">
          {ACTIVITY_ACCESS_ORDER.map((key) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={access.activityAccess[key]}
                onChange={(e) => handleActivityAccessChange(key, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{formatLabel(key)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Workspace Access */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Workspace Access</h2>
        <div className="grid grid-cols-1 gap-3">
          {WORKSPACE_ACCESS_ORDER.map((key) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={access.workspaceAccess[key]}
                onChange={(e) => handleWorkspaceAccessChange(key, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{formatLabel(key)}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="my-4" />
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push('/user-management')}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
} 