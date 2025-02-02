'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [divisions, setDivisions] = useState([]);
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
        const [projectRes, divisionsRes] = await Promise.all([
          fetch(`/api/projects/${params.id}`),
          fetch('/api/work-divisions')
        ]);

        if (!projectRes.ok || !divisionsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [projectData, divisionsData] = await Promise.all([
          projectRes.json(),
          divisionsRes.json()
        ]);

        console.log('Project Data:', projectData); // Untuk debugging

        // Format tanggal ke YYYY-MM-DD
        const formatDate = (date: string) => {
          if (!date) return '';
          return new Date(date).toISOString().split('T')[0];
        };

        setDivisions(divisionsData);
        setFormData({
          workDivisionId: projectData.workDivision, 
          projectId: projectData.projectId,
          projectCode: projectData.projectCode,              
          projectTitle: projectData.projectTitle,
          description: projectData.description,
          requestDate: projectData.requestDate,
          year: parseInt(projectData.year),
          startDate: formatDate(projectData.startDate),
          finishDate: formatDate(projectData.finishDate),
          documents: projectData.documents || [],
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
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

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Project</h1>

      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
          <div>ID: {formData.projectId}</div>
          <div>Request Date: {formatDate(formData.requestDate)}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-6 space-y-6">
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
                  <option key={division.id} value={division.id}>{division.divisionName}</option>
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
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
                rows={4}
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
            onClick={() => router.back()}
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