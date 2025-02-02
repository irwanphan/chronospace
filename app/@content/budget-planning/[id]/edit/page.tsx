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
  description: string;
}

interface Project {
  id: string;
  title: string;  // Sesuaikan dengan field yang benar dari database
}

export default function EditBudgetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    title: '',
    year: '',
    division: '',
    totalBudget: '',
    startDate: '',
    finishDate: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch budget dan projects data
        const [budgetRes, projectsRes] = await Promise.all([
          fetch(`/api/budgets/${params.id}`),
          fetch('/api/projects')
        ]);

        if (!budgetRes.ok || !projectsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [budgetData, projectsData] = await Promise.all([
          budgetRes.json(),
          projectsRes.json()
        ]);

        console.log('Budget Data:', budgetData); // Untuk debugging

        // Format tanggal
        const formatDate = (date: string) => {
          if (!date) return '';
          return new Date(date).toISOString().split('T')[0];
        };

        // Format number
        const formatNumber = (num: number) => {
          if (!num) return '';
          return new Intl.NumberFormat('id-ID').format(num);
        };

        setProjects(projectsData);
        setFormData({
          projectId: budgetData.projectId || '',
          title: budgetData.title || '',
          year: budgetData.year?.toString() || '',
          division: budgetData.division || '',
          totalBudget: formatNumber(budgetData.totalBudget) || '',
          startDate: formatDate(budgetData.startDate) || '',
          finishDate: formatDate(budgetData.finishDate) || '',
          description: budgetData.description || '',
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
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/budgets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalBudget: parseFloat(formData.totalBudget.replace(/[,.]/g, '')),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget plan');
      }

      router.push('/budget-planning');
      router.refresh();
    } catch (error) {
      console.error('Error updating budget:', error);
      alert(error instanceof Error ? error.message : 'Failed to update budget plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Budget Plan</h1>

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
                  {project.title}
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

        <div>
          <label className="block mb-1.5">Description</label>
          <RichTextEditor
            value={formData.description || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 