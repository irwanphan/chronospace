import { Budget } from '@/types/budget';
import { Project } from '@/types/project';
import { PurchaseRequest } from '@/types/purchase-request';
import { ApprovalStep } from '@/types/approval-schema';

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

export const calculateBudgetStats = (budgets: Budget[]) => {
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

export const calculateRequestStats = (requests: PurchaseRequest[]) => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth - 1;
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  
  // Current stats
  const allRequests = requests.length;
  
  // New requests (created in last 30 days)
  const newRequests = requests.filter(req => {
    const createdAt = new Date(req.createdAt);
    return createdAt >= thirtyDaysAgo;
  }).length;

  // Stale requests (past project finish date and not completed/rejected)
  const staleRequests = requests.filter(req => {
    const finishDate = new Date(req.budget.project.finishDate);
    return finishDate < now && 
           req.status !== 'Approved' && 
           req.status !== 'Rejected';
  }).length;
  // const staleRequests = 0

  // Completed requests
  const completedRequests = requests.filter(req => 
    req.status === 'Approved'
  ).length;

  // Calculate changes
  // // TODO: diambil dari API
  // const allRequestsChange = requests.length - previousTotalRequests; 
  const allRequestsChange = 0

  // New requests this month vs last month
  const thisMonthNewRequests = requests.filter(req => {
    const createdAt = new Date(req.createdAt);
    return createdAt.getMonth() === thisMonth;
  }).length;

  const lastMonthNewRequests = requests.filter(req => {
    const createdAt = new Date(req.createdAt);
    return createdAt.getMonth() === lastMonth;
  }).length;

  const newRequestsChange = thisMonthNewRequests - lastMonthNewRequests;

  // Stale requests change (current vs previous count)
  // TODO: pass budget in
  // const previousStaleRequests = requests.filter(req => {
  //   const finishDate = new Date(req.budget.project.finishDate);
  //   const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  //   return finishDate < thirtyDaysAgo && 
  //          req.status !== 'Completed' && 
  //          req.status !== 'Rejected';
  // }).length;

  // const staleRequestsChange = staleRequests - previousStaleRequests;
  const staleRequestsChange = 0

  // TODO: diambil dari API
  // Completed requests this month vs last month
  // const thisMonthCompleted = requests.filter(req => {
  //   const statusDate = new Date(req.updatedAt); // add updatedAt field
  //   return req.status === 'Completed' && statusDate.getMonth() === thisMonth;
  // }).length;

  // const lastMonthCompleted = requests.filter(req => {
  //   const statusDate = new Date(req.updatedAt);
  //   return req.status === 'Completed' && statusDate.getMonth() === lastMonth;
  // }).length;

  // const completedRequestsChange = thisMonthCompleted - lastMonthCompleted;
  const completedRequestsChange = 0

  return {
    allRequests,
    newRequests,
    staleRequests,
    completedRequests,
    allRequestsChange,
    newRequestsChange,
    staleRequestsChange,
    completedRequestsChange
  };
};

export const getViewers = async (steps: ApprovalStep[]) => {
  const result = {
    specificUserIds: [] as string[],
    roleIds: [] as string[]
  };

  // Sort steps by order
  const sortedSteps = steps.sort((a, b) => a.stepOrder - b.stepOrder);
  
  // Cek setiap step
  sortedSteps.forEach(step => {
    // console.log('Processing step:', step); // Debug
    // Jika ada specificUser, tambahkan ke specificUserIds
    if (step.specificUserId && step.specificUserId !== 'NULL') {
      result.specificUserIds.push(step.specificUserId);
    }
    // Jika tidak ada specificUser, tambahkan roleId
    else if (step.roleId) {
      result.roleIds.push(step.roleId);
    }
  });

  // console.log('Final result getViewers: ', result); // Debug
  return result;
};

export const getCurrentApprover = async (steps: ApprovalStep[]) => {
  const result = {
    specificUserId: '',
    roleId: ''
  };
  
  const currentStep = steps.find(step => step.status === 'Updated' || step.status === 'Pending');

  if (currentStep) {
    if (currentStep.specificUserId && currentStep.specificUserId !== 'NULL') {
      result.specificUserId = currentStep.specificUserId;
    } else {
      result.roleId = currentStep.roleId;
    }
  }

  // console.log('Final result getCurrentApprover: ', result); // Debug
  return result;
};