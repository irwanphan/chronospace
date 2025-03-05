'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatISODate } from '@/lib/utils';
import { RichTextEditor } from '@/components/RichTextEditor';
import { WorkDivision } from '@prisma/client';
import LoadingSpin from '@/components/ui/LoadingSpin';

export default function EditProjectPage({ params }: { params: { id: string } }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/project-planning/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/project-planning');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Project Plan</h1>

      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
          <div>ID: {formData.projectId}</div>
          <div>Request Date: {formatDate(formData.requestDate)}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-6 space-y-6 border border-gray-200">
          <h2 className="text-lg font-semibold">Request Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Work Division <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.workDivisionId}
                onChange={(e) => setFormData(prev => ({ ...prev, workDivisionId: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                required
              >
                <option value="">Select Division</option>
                {divisions.map(division => (
                  <option 
                    key={division.id} 
                    value={division.id}
                    selected={division.id === formData.workDivisionId}
                  >
                    {division.divisionName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Project Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.projectCode}
                onChange={(e) => setFormData(prev => ({ ...prev, projectCode: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Project Title / Project Brief <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Project Full Description
              </label>
              <RichTextEditor
                value={formData.description || ''}
                onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                  required
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Finish Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.finishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, finishDate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Supporting Documents
              </label>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Document
              </button>
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
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
} 