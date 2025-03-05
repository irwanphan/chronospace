'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { WorkDivision } from '@/types/workDivision';
import { User } from '@/types/user';
import LoadingSpin from '@/components/ui/LoadingSpin';

export default function ViewWorkDivisionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    divisionCode?: string;
    general?: string;
  }>({});
  const [division, setDivision] = useState<WorkDivision>();
  const [divisionHeadUser, setDivisionHeadUser] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspace-management/work-division/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        setDivision(data.division);
        const headUser = data.users.find((user: User) => user.id === data.division.divisionHead);
        setDivisionHeadUser(headUser?.name || 'Not assigned');
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ general: 'Failed to load data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) return <LoadingSpin />

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">View Work Division</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <form className="space-y-6 bg-white border border-gray-200 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">
            Division Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={division?.divisionCode}
            className={`w-full px-4 py-2 border rounded-lg`}
            readOnly
          />
          {errors.divisionCode && (
            <p className="mt-1 text-sm text-red-600">{errors.divisionCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Division Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={division?.divisionName}
            className="w-full px-4 py-2 border rounded-lg"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <div 
            className="w-full px-4 py-2 border rounded-lg"
            dangerouslySetInnerHTML={{ __html: division?.description || '' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Upper Division</label>
            <input
              type="text"
              value={division?.upperDivision}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Division Head</label>
            <input
              type="text"
              value={divisionHeadUser}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              readOnly
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/workspace-management/work-division`)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            onClick={() => router.push(`/workspace-management/work-division/${params.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </form>
    </div>
  );
} 