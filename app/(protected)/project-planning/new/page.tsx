'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { X } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { formatDate, generateId } from '@/lib/utils';

interface Division {
  id: string;
  divisionName: string;
}
interface FormData {
  projectCode: string;
  projectTitle: string;
  description: string;
  division: string;
  year: string;
  startDate: string;
  finishDate: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>('');
  const [requestDate, setRequestDate] = useState<string>('');
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [formData, setFormData] = useState<FormData>({
    projectCode: '',
    projectTitle: '',
    description: '',
    division: '',
    year: new Date().getFullYear().toString(),
    startDate: '',
    finishDate: '',
  });

  console.log(divisions)

  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/workspace-management/work-division');
      if (!response.ok) throw new Error('Failed to fetch divisions');
      
      const data = await response.json();
      setDivisions(data.divisions || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
    // Generate ID dan request date
    const prefix = 'PRJ';
    setProjectId(generateId(prefix));
    setRequestDate(formatDate(new Date()));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Submitting data:', formData); // Debug log

      const response = await fetch('/api/project-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          projectId, // ID yang di-generate
          requestDate, // Tanggal request yang di-generate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result = await response.json();
      console.log('Success:', result); // Debug log

      router.push('/project-planning');
      router.refresh();
    } catch (error) {
      console.error('Error creating project:', error);
      alert(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">New Project</h1>
      
      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
          <div>
            ID: {projectId}
          </div>
          <div>
            Request Date: {requestDate}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Request Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5">
              Work Division <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.division}
              onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              required
            >
              <option value="">Select Division</option>
              {Array.isArray(divisions) && divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.divisionName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5">
              Project Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.projectCode}
              onChange={(e) => setFormData(prev => ({ ...prev, projectCode: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Project Title / Project Brief <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Project Full Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1.5">
                Project Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                required
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block mb-1.5">
                Finish Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.finishDate}
                onChange={(e) => setFormData(prev => ({ ...prev, finishDate: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5">
              Supporting Documents
            </label>
            <div className="border rounded-lg p-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Document
              </button>
              <p className="text-sm text-gray-500 mt-2">No document uploaded</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/project-planning"
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