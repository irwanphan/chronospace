interface StatsCardProps {
  title: string;
  value: number;
}

function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value} Projects</div>
    </div>
  );
}

interface StatsOverviewProps {
  stats: {
    total: number;
    budgetAllocated: number;
    active: number;
    delayed: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatsCard title="Total Planned Projects" value={stats.total} />
      <StatsCard title="Budget Allocated Projects" value={stats.budgetAllocated} />
      <StatsCard title="Active Projects" value={stats.active} />
      <StatsCard title="Delayed Projects" value={stats.delayed} />
    </div>
  );
} 