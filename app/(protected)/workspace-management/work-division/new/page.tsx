'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import Card from '@/components/ui/Card';

interface WorkDivision {
  id: string;
  code: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function NewWorkDivisionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workDivisions, setWorkDivisions] = useState<WorkDivision[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    upperWorkDivisionId: '',
    headId: '',
  });
  const [errors, setErrors] = useState<{
    divisionCode?: string;
    general?: string;
  }>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/workspace-management/work-division/fetch-users-workdivisions');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setWorkDivisions(data.workDivisions);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/workspace-management/work-division', {
        method: 'POST',
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
      console.error('Error creating work division:', error);
      setErrors({ general: 'Failed to create work division' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Work Division</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5">
                Work Division Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.divisionCode ? 'border-red-500' : ''}`}
                placeholder="HR"
                required
              />
              {errors.divisionCode && (
                <p className="mt-1 text-sm text-red-600">{errors.divisionCode}</p>
              )}
            </div>

            <div>
              <label className="block mb-1.5">
                Work Division Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Human Resources"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Work Division Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5">
                  Upper Work Division (Parent)
                </label>
                <select
                  value={formData.upperWorkDivisionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, upperWorkDivisionId: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="">-</option>
                  {workDivisions
                    .filter(division => division.code !== formData.code)
                    .map((workDivision) => (
                      <option key={workDivision.id} value={workDivision.id}>
                        {workDivision.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block mb-1.5">
                  Work Division Head
                </label>
                <select
                  value={formData.headId}
                  onChange={(e) => setFormData(prev => ({ ...prev, headId: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="">-</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Link
              href="/workspace-management/work-division"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 