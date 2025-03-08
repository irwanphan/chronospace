'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatISODate, stripHtmlTags } from '@/lib/utils';
import { WorkDivision } from '@prisma/client';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function ViewProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [formData, setFormData] = useState({
    workDivisionId: '',
    projectId: '',
    projectCode: '',
    projectTitle: '',
    description: '',
    requestDate: '',
    year: new Date().getFullYear(),
    startDate: '',
    finishDate: '',
    documents: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/project-planning/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setDivisions(data.divisions);
        setFormData({
          workDivisionId: data.project.workDivisionId || '',
          projectId: data.project.projectId,
          projectCode: data.project.projectCode,              
          projectTitle: data.project.projectTitle,
          description: data.project.description,
          requestDate: formatISODate(data.project.requestDate),
          year: parseInt(data.project.year),
          startDate: formatISODate(data.project.startDate),
          finishDate: formatISODate(data.project.finishDate),
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

      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
          <div>ID: {formData.projectId}</div>
          <div>Request Date: {formatDate(formData.requestDate)}</div>
        </div>
      </div>

      <Card className="p-6">
        <form className="space-y-6">
          <div className="bg-white rounded-lg p-6 space-y-6 border border-gray-200">
            <h2 className="text-lg font-semibold">Request Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Work Division <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={divisions.find(d => d.id === formData.workDivisionId)?.divisionName || ''}
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectCode}
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Title / Project Brief <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectTitle}
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
          </div>

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
              onClick={() => router.push(`/project-planning/${params.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 