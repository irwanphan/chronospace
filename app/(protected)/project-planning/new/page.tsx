'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { X } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { formatDate, formatISODate, generateId } from '@/lib/utils';
import Card from '@/components/ui/Card';
import LoadingSpin from '@/components/ui/LoadingSpin';

interface WorkDivision {
  id: string;
  name: string;
}
interface FormData {
  projectCode: string;
  projectTitle: string;
  description: string;
  workDivisionId: string;
  year: string;
  startDate: string;
  finishDate: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectCode, setProjectCode] = useState<string>('');
  const [requestDate, setRequestDate] = useState<string>('');
  const [workDivisions, setWorkDivisions] = useState<WorkDivision[]>([]);
  const [formData, setFormData] = useState<FormData>({
    projectCode: '',
    projectTitle: '',
    description: '',
    workDivisionId: '',
    year: new Date().getFullYear().toString(),
    startDate: formatISODate(new Date()),
    finishDate: formatISODate(new Date()),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchWorkDivisions = async () => {
    try {
      const response = await fetch('/api/workspace-management/work-division');
      if (!response.ok) throw new Error('Failed to fetch work divisions');
      
      const data = await response.json();
      setWorkDivisions(data.workDivisions || []);
    } catch (error) {
      console.error('Error fetching work divisions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkDivisions();
    // Generate ID dan request date
    const prefix = 'PRJ';
    setProjectCode(generateId(prefix));
    setRequestDate(formatDate(new Date()));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Validasi form
      if (!projectCode || !formData.projectTitle || !formData.workDivisionId || !formData.year) {
        throw new Error('Please fill all required fields');
      }

      // Siapkan data project dan file
      const projectData = {
        code: projectCode,
        title: formData.projectTitle,
        description: formData.description || '',
        workDivisionId: formData.workDivisionId,
        year: Number(formData.year),
        startDate: formData.startDate,
        finishDate: formData.finishDate,
        userId: session.user.id,
        file: selectedFile || null, // Tambahkan file ke data yang akan dikirim
      };

      // Kirim data menggunakan FormData
      const formDataToSend = new FormData();
      formDataToSend.append('projectData', JSON.stringify(projectData));
      if (selectedFile) {
        // Pastikan file yang dipilih valid
        if (selectedFile instanceof File) {
          formDataToSend.append('file', selectedFile);
        }
      }

      const response = await fetch('/api/project-planning', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      router.push('/project-planning');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">New Project</h1>
      
      <Card>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
          <div>
            Project Code: <span className="font-bold">{projectCode}</span>
          </div>
          <div>
            Request Date: <span className="font-bold">{requestDate}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Request Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5">
                Work Division <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.workDivisionId}
                onChange={(e) => setFormData(prev => ({ ...prev, workDivisionId: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                required
              >
                <option value="">Select Division</option>
                {Array.isArray(workDivisions) && workDivisions.map((workDivision) => (
                  <option key={workDivision.id} value={workDivision.id}>
                    {workDivision.name}
                  </option>
                ))}
              </select>
            </div>

            {/* <div>
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
            </div> */}

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
                  {/* TODO: create starting year in config */}
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
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    Upload Document
                  </button>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedFile ? selectedFile.name : 'No document uploaded'}
                </p>
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
      </Card>
    </div>
  );
} 