'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
export default function EditRolePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    roleCode?: string;
    general?: string;
  }>({});
  const [formData, setFormData] = useState({
    roleCode: '',
    roleName: '',
    description: '',
    budgetLimit: 0,
  });

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch(`/api/workspace-management/roles/${params.id}`);
        const data = await response.json();
        
        setFormData({
          roleCode: data.roleCode,
          roleName: data.roleName,
          description: data.description || '',
          budgetLimit: data.budgetLimit || 0,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching role:', error);
        setErrors({ general: 'Failed to load role data' });
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch(`/api/workspace-management/roles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes('Role code')) {
          setErrors(prev => ({ ...prev, roleCode: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error }));
        }
        return;
      }

      router.push('/workspace-management/role');
    } catch (error) {
      console.error('Error updating role:', error);
      setErrors({ general: 'Failed to update role' });
    }
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Role</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Role Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roleCode}
              onChange={(e) => setFormData(prev => ({ ...prev, roleCode: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg ${errors.roleCode ? 'border-red-500' : ''}`}
              required
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
              value={formData.roleName}
              onChange={(e) => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Budget Limit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.budgetLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, budgetLimit: Number(e.target.value) }))}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/workspace-management/role`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 