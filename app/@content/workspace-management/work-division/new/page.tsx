'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';

interface WorkDivision {
  id: string;
  divisionCode: string;
  divisionName: string;
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
    divisionCode: '',
    divisionName: '',
    description: '',
    upperDivision: '',
    divisionHead: '',
  });

  useEffect(() => {
    const fetchWorkDivisions = async () => {
      try {
        const response = await fetch('/api/work-divisions');
        if (response.ok) {
          const data = await response.json();
          setWorkDivisions(data);
        }
      } catch (error) {
        console.error('Error fetching work divisions:', error);
      }
    };

    fetchWorkDivisions();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/work-divisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create work division');
      }

      router.push('/workspace-management/work-division');
      router.refresh();
    } catch (error) {
      console.error('Error creating work division:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Work Division</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5">
              Division Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.divisionCode}
              onChange={(e) => setFormData(prev => ({ ...prev, divisionCode: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="HR"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Division Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.divisionName}
              onChange={(e) => setFormData(prev => ({ ...prev, divisionName: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Human Resources"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Division Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5">
                Upper Division (Parent)
              </label>
              <select
                value={formData.upperDivision}
                onChange={(e) => setFormData(prev => ({ ...prev, upperDivision: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">-</option>
                {workDivisions
                  .filter(division => division.divisionCode !== formData.divisionCode)
                  .map((workDivision) => (
                    <option key={workDivision.id} value={workDivision.id}>
                      {workDivision.divisionName}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5">
                Division Head
              </label>
              <select
                value={formData.divisionHead}
                onChange={(e) => setFormData(prev => ({ ...prev, divisionHead: e.target.value }))}
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
    </div>
  );
} 