'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatISODate, stripHtmlTags } from '@/lib/utils';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function ViewProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projectStatus, setProjectStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    workDivisionId: '',
    code: '',
    title: '',
    description: '',
    year: new Date().getFullYear(),
    startDate: '',
    finishDate: '',
    createdAt: '',
    documents: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/project-planning/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setProjectStatus(data.project.status);
        setFormData({
          workDivisionId: data.project.workDivision.id || '',
          code: data.project.code,              
          title: data.project.title,
          description: data.project.description,
          year: parseInt(data.project.year),
          startDate: formatISODate(data.project.startDate),
          finishDate: formatISODate(data.project.finishDate),
          createdAt: formatISODate(data.project.createdAt),
          documents: data.project.documents || [],
        });
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">View Project Plan</h1>

      <Card>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
          <div>Code: <span className="font-bold">{formData.code}</span></div>
          <div>Request Date: <span className="font-bold">{formatDate(formData.createdAt)}</span></div>
        </div>
      </Card>

      <Card className="p-6">
        <form className="space-y-6">

          <h2 className="text-lg font-semibold">Request Information</h2>

          <div className="space-y-4">
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

            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Project Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.projectCode}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Project Title / Project Brief <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Project Full Description
              </label>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                {stripHtmlTags(formData.description)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.year}
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Finish Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.finishDate}
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Supporting Documents
              </label>
              <div className="mt-2 text-sm text-gray-500">
                No document uploaded
              </div>
            </div>
          </div>

          <hr className="my-6" />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/project-planning')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              disabled={projectStatus === 'Allocated'}
              onClick={() => router.push(`/project-planning/${params.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Edit
            </button>
          </div>
          {projectStatus === 'Allocated' && (
            <div className="flex justify-end text-gray-500 text-sm mt-4 block w-full">
              Project is allocated and cannot be edited.
            </div>
          )}
        </form>
      </Card>
    </div>
  );
} 