'use client';
import { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Project } from '@/types/project';
import ProjectActions from './components/ProjectActions';
import { calculateProjectStats } from '@/lib/helpers';
import StatsOverview from './components/StatsOverview';
import Pagination from '@/components/Pagination';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WorkDivision {
  id: string;
  name: string;
  code: string;
}

export default function ProjectPlanningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    budgetAllocated: 0,
    active: 0,
    delayed: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [workDivisions, setWorkDivisions] = useState<WorkDivision[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/project-planning');
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects);
          setStats(calculateProjectStats(data.projects));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchWorkDivisions = async () => {
      try {
        const response = await fetch('/api/work-divisions');
        const data = await response.json();
        setWorkDivisions(data);
        // Initially select all divisions
        setSelectedDivisions(data.map((div: WorkDivision) => div.id));
      } catch (error) {
        console.error('Error fetching work divisions:', error);
      }
    };

    fetchWorkDivisions();
  }, []);

  const handleDivisionToggle = (divisionId: string) => {
    setSelectedDivisions(prev => 
      prev.includes(divisionId)
        ? prev.filter(id => id !== divisionId)
        : [...prev, divisionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDivisions(workDivisions.map(div => div.id));
  };

  const handleDeselectAll = () => {
    setSelectedDivisions([]);
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Project Plans Overview</h1>
      </div>

      <StatsOverview stats={stats} />

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
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
                {selectedDivisions.length < workDivisions.length && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {selectedDivisions.length}/{workDivisions.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Filter by Work Division</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {workDivisions.map((division) => (
                    <div key={division.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={division.id}
                        checked={selectedDivisions.includes(division.id)}
                        onCheckedChange={() => handleDivisionToggle(division.id)}
                      />
                      <label
                        htmlFor={division.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {division.name} ({division.code})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/project-planning/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Project Plan
          </Link>
        </div>
      </div>

      <Card className="mb-8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Code</th>
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
            {currentProjects.map((project, index) => (
              <tr key={project.id} className="hover:bg-blue-50">
                <td className="px-6 py-2 text-sm">{startIndex + index + 1}</td>
                <td className="px-6 py-2 text-sm">{project.code}</td>
                <td className="px-6 py-2 text-sm">{project.title}</td>
                <td className="px-6 py-2 text-sm">{project.year}</td>
                <td className="px-6 py-2 text-sm">{project.workDivision.name}</td>
                <td className="px-6 py-2 text-sm">{project.status}</td>
                <td className="px-6 py-2 text-sm">{formatDate(project.startDate)}</td>
                <td className="px-6 py-2 text-sm">{formatDate(project.finishDate)}</td>
                <td className="px-6 py-2 text-right">
                  <ProjectActions 
                    projectId={project.id}
                    projectStatus={project.status}
                    onDelete={async () => {
                      const projectsRes = await fetch('/api/project-planning');
                      const projectsData = await projectsRes.json();
                      setProjects(projectsData.projects);
                      setStats(calculateProjectStats(projectsData.projects));
                    }} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalItems={projects.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 