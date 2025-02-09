'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccessControl {
  menuAccess: {
    timeline: boolean;
    workspace: boolean;
    projectPlanning: boolean;
    budgetPlanning: boolean;
    userManagement: boolean;
    workspaceManagement: boolean;
  };
  activityAccess: {
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
  };
  workspaceAccess: {
    createPurchaseRequest: boolean;
    reviewApprovePurchaseRequest: boolean;
  };
}

export default function UserAccessControlPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [access, setAccess] = useState<AccessControl>({
    menuAccess: {
      timeline: true,
      workspace: true,
      projectPlanning: true,
      budgetPlanning: true,
      userManagement: true,
      workspaceManagement: true
    },
    activityAccess: {
      createProject: true,
      editProject: true,
      deleteProject: true,
      createBudget: true,
      editBudget: true,
      deleteBudget: true,
      createWorkDivision: true,
      editWorkDivision: true,
      deleteWorkDivision: true,
      createRole: true,
      editRole: true,
      deleteRole: true,
      createVendor: true,
      editVendor: true,
      deleteVendor: true,
      createApprovalSchema: true,
      editApprovalSchema: true,
      deleteApprovalSchema: true,
      createUser: true,
      editUser: true,
      deleteUser: true
    },
    workspaceAccess: {
      createPurchaseRequest: true,
      reviewApprovePurchaseRequest: true
    }
  });

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">User Access Control</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-medium mb-4">Menu Access</h2>
          <div className="space-y-3">
            {Object.entries(access.menuAccess).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setAccess({
                    ...access,
                    menuAccess: {
                      ...access.menuAccess,
                      [key]: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                  id={key}
                />
                <label className="ml-2 capitalize cursor-pointer" htmlFor={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-4">Activity Access</h2>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(access.activityAccess).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setAccess({
                    ...access,
                    activityAccess: {
                      ...access.activityAccess,
                      [key]: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                  id={key}
                />
                <label className="ml-2 capitalize cursor-pointer" htmlFor={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-4">Workspace Access</h2>
          <div className="space-y-3">
            {Object.entries(access.workspaceAccess).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setAccess({
                    ...access,
                    workspaceAccess: {
                      ...access.workspaceAccess,
                      [key]: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                  id={key}
                />
                <label className="ml-2 capitalize cursor-pointer" htmlFor={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </section>

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
    </div>
  );
} 