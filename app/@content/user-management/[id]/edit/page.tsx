'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    email?: string;
    employeeId?: string;
    residentId?: string;
    general?: string;
  }>({});
  // const [roles, setRoles] = useState([]);
  // const [divisions, setDivisions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    workDivisionId: '',
    employeeId: '',
    address: '',
    residentId: '',
    nationality: '',
    birthday: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          // fetch('/api/roles'),
          // fetch('/api/work-divisions')
        ]);

        const [userData] = await Promise.all([
          userRes.json(),
          // rolesRes.json(),
          // divisionsRes.json()
        ]);

        // setRoles(rolesData);
        // setDivisions(divisionsData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          roleId: userData.roleId,
          workDivisionId: userData.workDivisionId,
          employeeId: userData.employeeId,
          address: userData.address || '',
          residentId: userData.residentId,
          nationality: userData.nationality,
          birthday: userData.birthday,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setErrors({ general: 'Failed to load data' });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes('Email')) {
          setErrors(prev => ({ ...prev, email: data.error }));
        } else if (data.error.includes('Employee ID')) {
          setErrors(prev => ({ ...prev, employeeId: data.error }));
        } else if (data.error.includes('Resident ID')) {
          setErrors(prev => ({ ...prev, residentId: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error }));
        }
        return;
      }

      router.push('/user-management');
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ general: 'Failed to update user' });
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit User</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Similar form fields as create new, with error handling */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Add other form fields with similar pattern */}

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
    </div>
  );
} 