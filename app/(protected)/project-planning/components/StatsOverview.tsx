import Card from "@/components/ui/Card";
import { IconCaptureFilled, IconBusinessplan, IconCampfireFilled, IconPercentage66, IconInfoCircleFilled } from "@tabler/icons-react";

const getIcon = (title: string) => {
  switch (title) {
    case "Total Planned Projects":
      return IconCaptureFilled;
    case "Budget Allocated Projects":
      return IconBusinessplan;
    case "Active Projects":
      return IconCampfireFilled;
    case "Delayed Projects":
      return IconPercentage66;
    default:
      return IconInfoCircleFilled;
  }
};
const getIconColor = (title: string) => {
  switch (title) {
    case "Total Planned Projects":
      return "text-blue-600";
    case "Budget Allocated Projects":
      return "text-blue-600";
    case "Active Projects":
      return "text-green-600";
    case "Delayed Projects":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
interface StatsCardProps {
  title: string;
  value: number;
}

function StatsCard({ title, value }: StatsCardProps) {
  const Icon = getIcon(title);
  const IconColor = getIconColor(title);
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute bottom-0 right-0 transform translate-x-6 translate-y-6 opacity-[0.08]
        ${IconColor}
      `}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-2xl font-semibold mt-1">{value} Projects</div>
      </div>
    </Card>
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