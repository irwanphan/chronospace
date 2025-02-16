'use client';
import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreVertical, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface Project {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  division: string;
  status: string;
  startDate: string;
  finishDate: string;
  year: number;
}

export default function ProjectPlanningPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    budgetAllocated: 0,
    active: 0,
    delayed: 0
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
          // Calculate stats
          setStats({
            total: data.length,
            budgetAllocated: data.filter((p: Project) => p.status === 'Allocated').length,
            active: data.filter((p: Project) => p.status === 'Active').length,
            delayed: data.filter((p: Project) => p.status === 'Delayed').length,
          });
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Refresh data
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Project Plans Overview</h1>
        <div className="flex items-center gap-2">
          <input type="month" defaultValue="2025-01" className="px-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Total Planned Projects</div>
          <div className="text-2xl font-semibold mt-1">{stats.total} Projects</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Budget Allocated Projects</div>
          <div className="text-2xl font-semibold mt-1">{stats.budgetAllocated} Projects</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Active Projects</div>
          <div className="text-2xl font-semibold mt-1">{stats.active} Projects</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Delayed Projects</div>
          <div className="text-2xl font-semibold mt-1">{stats.delayed} Projects</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/project-planning/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Year</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Division</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Start Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Finish Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{project.projectId}</td>
                <td className="px-6 py-4 text-sm">{project.projectTitle}</td>
                <td className="px-6 py-4 text-sm">{project.year}</td>
                <td className="px-6 py-4 text-sm">{project.division}</td>
                <td className="px-6 py-4 text-sm">{project.status}</td>
                <td className="px-6 py-4 text-sm">{formatDate(project.startDate)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(project.finishDate)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="relative overflow-visible">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {activeMenu === project.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-2 w-36 z-50">
                        <button
                          onClick={() => router.push(`/project-planning/${project.id}/edit`)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button className="px-3 py-1 rounded bg-blue-50 text-blue-600">1</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">2</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">3</button>
      </div>
    </div>
  );
} 