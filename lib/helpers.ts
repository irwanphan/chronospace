import { Budget } from '@/types/budget';
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

export const calculateStats = (budgets: Budget[]) => {
  const total = budgets.reduce((sum: number, budget: Budget) => sum + budget.totalBudget, 0);
  const completed = budgets.filter((b: Budget) => b.status === 'Completed').length;
  const inProgress = budgets.filter((b: Budget) => b.status === 'In Progress').length;
  const delayed = budgets.filter((b: Budget) => {
    const startDate = new Date(b.startDate);
    const today = new Date();
    return startDate < today && b.status === 'Not Started';
  }).length;
  const upcoming = budgets.filter((b: Budget) => {
    const finishDate = new Date(b.finishDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return finishDate <= thirtyDaysFromNow && finishDate >= today;
  }).length;

  return {
    totalBudget: total,
    totalPlans: budgets.length,
    completedPercentage: budgets.length > 0 ? Math.round((completed / budgets.length) * 100) : 0,
    upcomingDeadlines: upcoming,
    inProgress: inProgress,
    delayed: delayed
  };
};