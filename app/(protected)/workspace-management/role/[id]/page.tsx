'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/role';

export default function ViewRolePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    roleCode?: string;
    general?: string;
  }>({});
  const [role, setRole] = useState<Role>({} as Role);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch(`/api/workspace-management/roles/${params.id}`);
        const data = await response.json();
        setRole(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching role:', error);
        setErrors({ general: 'Failed to load role data' });
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [params.id]);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">View Role</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <form className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Role Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role.roleCode}
            className={`w-full px-4 py-2 border rounded-lg`}
            readOnly
          />
          {errors.roleCode && (
            <p className="mt-1 text-sm text-red-600">{errors.roleCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role.roleName}
            className="w-full px-4 py-2 border rounded-lg"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <div 
            className="w-full px-4 py-2 border rounded-lg"
            dangerouslySetInnerHTML={{ __html: role.description || '' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Approval Limit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role.approvalLimit}
            className="w-full px-4 py-2 border rounded-lg"
            readOnly
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/workspace-management/role`)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => router.push(`/workspace-management/role/${params.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </form>
    </div>
  );
} 