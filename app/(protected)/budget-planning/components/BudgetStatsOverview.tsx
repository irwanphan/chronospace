import { formatCurrency } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

function StatsCard({ title, value, suffix }: StatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold mt-1">
        {value}{suffix && ` ${suffix}`}
      </div>
    </div>
  );
}

interface LargestBudgetsProps {
  budgets: {
    id: string;
    title: string;
    totalBudget: number;
  }[];
}

function LargestBudgets({ budgets }: LargestBudgetsProps) {
  return (
    <div className="col-span-6 bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="font-semibold mb-4">Largest Budget Plans</h2>
      {budgets.map((budget) => (
        <div key={budget.id} className="flex justify-between items-center mb-2">
          <div>{budget.title}</div>
          <div className="font-semibold">{formatCurrency(budget.totalBudget)}</div>
        </div>
      ))}
    </div>
  );
}

interface StatusCardProps {
  title: string;
  count: number;
  description: string;
}

function StatusCard({ title, count, description }: StatusCardProps) {
  return (
    <div className="col-span-3 bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="text-2xl font-semibold">{count} Plans</div>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
    </div>
  );
}

interface BudgetStatsOverviewProps {
  stats: {
    totalBudget: number;
    totalPlans: number;
    completedPercentage: number;
    upcomingDeadlines: number;
    inProgress: number;
    delayed: number;
  };
  largestBudgets: {
    id: string;
    title: string;
    totalBudget: number;
  }[];
}

export default function BudgetStatsOverview({ stats, largestBudgets }: BudgetStatsOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="Total Planned Budget" value={formatCurrency(stats.totalBudget)} />
        <StatsCard title="Number of Plans" value={stats.totalPlans} suffix="Plans" />
        <StatsCard title="Completed Plans Percentage" value={stats.completedPercentage} suffix="%" />
        <StatsCard title="Upcoming Deadlines" value={stats.upcomingDeadlines} suffix="Plans" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <LargestBudgets budgets={largestBudgets} />
        <StatusCard 
          title="Plans in Progress"
          count={stats.inProgress}
          description="Purchase Requests has been submitted"
        />
        <StatusCard 
          title="Delayed Plans"
          count={stats.delayed}
          description="Purchase Requests has not been submitted despite past Start Date"
        />
      </div>
    </div>
  );
} 