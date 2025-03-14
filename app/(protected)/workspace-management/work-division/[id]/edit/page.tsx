'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';

import { User } from '@/types/user';
import { WorkDivision } from '@/types/work-division';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function EditWorkDivisionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    code?: string;
    general?: string;
  }>({});
  const [users, setUsers] = useState<User[]>([]);
  const [workDivisions, setWorkDivisions] = useState<WorkDivision[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    headId: '',
    upperWorkDivisionId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspace-management/work-division/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        setFormData(data.workDivision);
        setUsers(data.users);
        setWorkDivisions(data.workDivisions);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ general: 'Failed to load data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch(`/api/workspace-management/work-division/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes('Division code')) {
          setErrors(prev => ({ ...prev, divisionCode: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error }));
        }
        return;
      }

      router.push('/workspace-management/work-division');
    } catch (error) {
      console.error('Error updating work division:', error);
      setErrors({ general: 'Failed to update work division' });
    }
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Work Division</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Work Division Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg ${errors.code ? 'border-red-500' : ''}`}
              required
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Work Division Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Work Division Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upper Work Division</label>
              <select
                value={formData.upperWorkDivisionId}
                onChange={(e) => setFormData(prev => ({ ...prev, upperWorkDivisionId: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">-</option>
                {workDivisions.map(div => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Work Division Head</label>
              <select
                value={formData.headId}
                onChange={(e) => setFormData(prev => ({ ...prev, headId: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">-</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
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