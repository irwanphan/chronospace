import { formatCurrency } from "@/lib/utils";
import { 
  IconPresentationFilled, 
  IconClock, 
  IconPresentationAnalyticsFilled, 
  IconInfoCircleFilled, 
  IconZoomMoneyFilled,
  IconPercentage80,
  IconLayout2Filled,
  IconRosetteDiscountCheckFilled 
} from "@tabler/icons-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

const getIcon = (title: string) => {
  switch (title) {
    case "Total Planned Budget":
      return IconPresentationFilled;
    case "Number of Plans":
      return IconPresentationAnalyticsFilled;
    case "Completed Plans Percentage":
      return IconRosetteDiscountCheckFilled;
    case "Upcoming Deadlines":
      return IconClock;
    case "Largest Budget Plans":
      return IconZoomMoneyFilled;
    case "Plans in Progress":
      return IconPercentage80;
    case "Delayed Plans":
      return IconLayout2Filled;
    default:
      return IconInfoCircleFilled;
  }
};
const getIconColor = (title: string) => {
  switch (title) {
    case "Total Planned Budget":
      return "text-blue-600";
    case "Number of Plans":
      return "text-blue-600";
    case "Completed Plans Percentage":
      return "text-green-600";
    case "Upcoming Deadlines":
      return "text-red-600";
    case "Largest Budget Plans":
      return "text-blue-600";
    case "Plans in Progress":
      return "text-green-600";
    case "Delayed Plans":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

function StatsCard({ title, value, suffix }: StatsCardProps) {
  const Icon = getIcon(title);
  const IconColor = getIconColor(title);
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 relative overflow-hidden">
      <div className={`absolute bottom-0 right-0 transform translate-x-6 translate-y-6 opacity-[0.08]
        ${IconColor}
      `}>
        <Icon size={120} />
      </div>

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
  const Icon = getIcon("Largest Budget Plans");
  const IconColor = getIconColor("Largest Budget Plans");
  return (
    <div className="col-span-6 bg-white p-4 rounded-lg shadow border border-gray-200 relative overflow-hidden">
      <div className={`absolute bottom-0 right-0 transform translate-x-6 translate-y-6 opacity-[0.08]
        ${IconColor}
      `}>
        <Icon size={120} />
      </div>
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
  const Icon = getIcon(title);
  const IconColor = getIconColor(title);
  return (
    <div className="col-span-3 bg-white p-4 rounded-lg shadow border border-gray-200 relative overflow-hidden">
      <div className={`absolute bottom-0 right-0 transform translate-x-6 translate-y-6 opacity-[0.08]
        ${IconColor}
      `}>
        <Icon size={120} />
      </div>
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