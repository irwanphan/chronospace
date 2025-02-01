'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function EditWorkDivisionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    divisionCode?: string;
    general?: string;
  }>({});
  const [formData, setFormData] = useState({
    divisionCode: '',
    divisionName: '',
    description: '',
    divisionHead: '',
  });

  useEffect(() => {
    const fetchDivision = async () => {
      try {
        const response = await fetch(`/api/work-divisions/${params.id}`);
        const data = await response.json();
        
        setFormData({
          divisionCode: data.divisionCode,
          divisionName: data.divisionName,
          description: data.description || '',
          divisionHead: data.divisionHead || '',
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching work division:', error);
        setErrors({ general: 'Failed to load division data' });
        setIsLoading(false);
      }
    };

    fetchDivision();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch(`/api/work-divisions/${params.id}`, {
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

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Work Division</h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div>
          <label className="block text-sm font-medium mb-1">
            Division Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.divisionCode}
            onChange={(e) => setFormData(prev => ({ ...prev, divisionCode: e.target.value }))}
            className={`w-full px-4 py-2 border rounded-lg ${errors.divisionCode ? 'border-red-500' : ''}`}
            required
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
            value={formData.divisionName}
            onChange={(e) => setFormData(prev => ({ ...prev, divisionName: e.target.value }))}
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
          <label className="block text-sm font-medium mb-1">Division Head</label>
          <input
            type="text"
            value={formData.divisionHead}
            onChange={(e) => setFormData(prev => ({ ...prev, divisionHead: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
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
    </div>
  );
} 