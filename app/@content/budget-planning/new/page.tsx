'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';

interface FormData {
  projectId: string;
  title: string;
  year: string;
  division: string;
  totalBudget: string;
  startDate: string;
  finishDate: string;
  description?: string;
}

interface Project {
  id: string;
  projectTitle: string;
}

export default function NewBudgetPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    title: '',
    year: new Date().getFullYear().toString(),
    division: '',
    totalBudget: '',
    startDate: '',
    finishDate: '',
    description: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalBudget: parseFloat(formData.totalBudget.replace(/[,.]/g, '')),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create budget plan');
      }

      router.push('/budget-planning');
      router.refresh();
    } catch (error) {
      console.error('Error creating budget:', error);
      alert(error instanceof Error ? error.message : 'Failed to create budget plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">New Budget Plan</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              required
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Total Budget <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.totalBudget}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setFormData(prev => ({
                  ...prev,
                  totalBudget: value ? new Intl.NumberFormat('id-ID').format(parseInt(value)) : ''
                }));
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Year <span className="text-red-500">*</span>
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

        <div className="mb-20">
          <label className="block mb-1.5">Description</label>
          <RichTextEditor
            value={formData.description || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Enter description..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/budget-planning"
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