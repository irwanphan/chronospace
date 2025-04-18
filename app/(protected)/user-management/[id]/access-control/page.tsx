'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AccessControl, MenuAccess, ActivityAccess, WorkspaceAccess } from '@/types/access-control';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconChevronLeft } from '@tabler/icons-react';

const MENU_ACCESS_ORDER = [
  'timeline',
  'workspace',
  'projectPlanning',
  'budgetPlanning',
  'userManagement',
  'workspaceManagement',
  'documents'
] as const;

const ACTIVITY_ACCESS_ORDER = [
  'createProject',
  'editProject',
  'deleteProject',
  'createBudget',
  'editBudget',
  'deleteBudget',
  'createWorkDivision',
  'editWorkDivision',
  'deleteWorkDivision',
  'createRole',
  'editRole',
  'deleteRole',
  'createVendor',
  'editVendor',
  'deleteVendor',
  'createApprovalSchema',
  'editApprovalSchema',
  'deleteApprovalSchema',
  'createUser',
  'editUser',
  'deleteUser',
  'changePassword',
  'changeOtherUserPassword',
  'manageUserAccess',
  'createDocument',
  'uploadDocument',
  'deleteDocument',
  'downloadDocument',
  'generateCertificate'
] as const;

const WORKSPACE_ACCESS_ORDER = [
  'createPurchaseRequest',
  'viewPurchaseRequest',
  'editPurchaseRequest',
  'reviewApprovePurchaseRequest',
  'viewOthersPurchaseRequest',
  'viewOtherDivisionPurchaseRequest',
  'createPurchaseOrder',
  'viewPurchaseOrder',
  'viewOthersPurchaseOrder',
  'viewOtherDivisionPurchaseOrder',
  'generatePurchaseOrderDocument',
  'signDocument'
] as const;

const createDefaultAccess = (): AccessControl => ({
  menuAccess: Object.fromEntries(
    MENU_ACCESS_ORDER.map(key => [key, false])
  ) as Record<keyof MenuAccess, boolean>,
  
  activityAccess: Object.fromEntries(
    ACTIVITY_ACCESS_ORDER.map(key => [key, false])
  ) as Record<keyof ActivityAccess, boolean>,
  
  workspaceAccess: Object.fromEntries(
    WORKSPACE_ACCESS_ORDER.map(key => [key, false])
  ) as Record<keyof WorkspaceAccess, boolean>
});

export default function UserAccessControlPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [access, setAccess] = useState<AccessControl>(createDefaultAccess());
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    const fetchUserAccess = async () => {
      try {
        const response = await fetch(`/api/user-management/${params.id}/access`);
        if (!response.ok) throw new Error('Failed to fetch access');
        const data = await response.json();
        setAccess(data);
        setUsername(data.user.name);
      } catch (error) {
        console.error('Error fetching access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAccess();
  }, [params.id]);

  if (isLoading) return <LoadingSpin />

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/user-management/${params.id}/access`, {
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
    return key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^[a-z]/, (str) => str.toUpperCase());
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="px-1 self-start" onClick={() => router.back()}>
          <IconChevronLeft className="w-4 h-4" stroke={4} />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">User Access Control</h1>
          <p className="text-gray-700">{username}</p>
        </div>
      </div>
      
      <Card className="p-6 space-y-6">
        {/* Menu Access */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Menu Access</h2>
          <div className="grid grid-cols-1 gap-3">
            {MENU_ACCESS_ORDER.map((key) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={access.menuAccess[key]}
                  onChange={(e) => handleMenuAccessChange(key, e.target.checked)}
                  className="rounded border-gray-300 w-4 h-4 cursor-pointer"
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
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={access.activityAccess[key]}
                  onChange={(e) => handleActivityAccessChange(key, e.target.checked)}
                  className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm">{formatLabel(key)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Workspace Access */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Workspace Access</h2>
          <div className="grid grid-cols-3 gap-3">
            {WORKSPACE_ACCESS_ORDER.map((key) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={access.workspaceAccess[key]}
                  onChange={(e) => handleWorkspaceAccessChange(key, e.target.checked)}
                  className="rounded border-gray-300 w-4 h-4 cursor-pointer"
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
      </Card>
    </div>
  );
} 