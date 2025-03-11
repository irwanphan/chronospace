'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function ViewUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    email?: string;
    employeeId?: string;
    residentId?: string;
    general?: string;
  }>({});
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
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user-management/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        console.log(data);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          roleId: data.user.role.roleName,
          workDivisionId: data.user.workDivision.name,
          employeeId: data.user.employeeId,
          address: data.user.address || '',
          residentId: data.user.residentId,
          nationality: data.user.nationality,
          birthday: new Date(data.user.birthday).toISOString().split('T')[0],
          password: '',
          confirmPassword: '',
        });
      } catch (error) {
        console.error('Error:', error);
        setErrors({ general: 'Failed to load data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">View User</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <Card className="p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                className="w-full px-4 py-2 border rounded-lg"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                className={`w-full px-4 py-2 border rounded-lg`}
                readOnly
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                className="w-full px-4 py-2 border rounded-lg"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.roleId}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Work Division <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.workDivisionId}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employeeId}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <div 
              className="w-full px-4 py-2 border rounded-lg"
              dangerouslySetInnerHTML={{ __html: formData.address || '' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Resident ID / Passport ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.residentId}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
              {errors.residentId && (
                <p className="mt-1 text-sm text-red-600">{errors.residentId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nationality}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Birthday <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.birthday}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push('/user-management')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => router.push(`/user-management/${params.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => router.push(`/user-management/${params.id}/access-control`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Access Control
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 