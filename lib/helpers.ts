import { Project } from '@/types/project';

export const calculateProjectStats = (projects: Project[]) => {
  const allocated = projects.filter((p: Project) => p.status === 'Allocated').length;
  const active = projects.filter((p: Project) => p.status === 'Active').length;
  const delayed = projects.filter((p: Project) => {
    const finishDate = new Date(p.finishDate);
    const today = new Date();
    return finishDate < today && p.status !== 'Completed';
  }).length;

  return {
    total: projects.length,
    budgetAllocated: allocated,
    active: active,
    delayed: delayed
  };
};