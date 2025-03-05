import StatCard from '@/components/StatCard';

interface WorkspaceStatsProps {
  stats: {
    allRequests: number;
    newRequests: number;
    staleRequests: number;
    completedRequests: number;
    // Untuk perubahan (changes)
    allRequestsChange: number;
    newRequestsChange: number;
    staleRequestsChange: number;
    completedRequestsChange: number;
  };
}

export default function WorkspaceStats({ stats }: WorkspaceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="All Requests Queue"
        count={stats.allRequests}
        change={stats.allRequestsChange}
        type={stats.allRequestsChange >= 0 ? "increase" : "decrease"}
      />
      <StatCard
        title="New Requests"
        count={stats.newRequests}
        change={stats.newRequestsChange}
        type={stats.newRequestsChange >= 0 ? "increase" : "decrease"}
      />
      <StatCard
        title="Stale Requests"
        count={stats.staleRequests}
        change={stats.staleRequestsChange}
        type={stats.staleRequestsChange >= 0 ? "increase" : "decrease"}
      />
      <StatCard
        title="Completed Requests"
        count={stats.completedRequests}
        change={stats.completedRequestsChange}
        type={stats.completedRequestsChange >= 0 ? "increase" : "decrease"}
      />
    </div>
  );
} 