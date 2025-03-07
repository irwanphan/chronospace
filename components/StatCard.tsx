import {
  IconCategoryFilled,
  IconSquareRoundedPlusFilled,
  IconBugFilled,
  IconFlagFilled,
  IconInfoCircleFilled
} from "@tabler/icons-react"
import Card from "./ui/Card";

interface StatCardProps {
  title: string;
  count: number;
  change: number;
  type?: 'increase' | 'decrease';
}

export default function StatCard({ title, count, change, type }: StatCardProps) {
  // Helper function to get icon based on title
  const getIcon = (title: string) => {
    switch (title) {
      case "All Requests Queue":
        return IconCategoryFilled;
      case "New Requests":
        return IconSquareRoundedPlusFilled;
      case "Stale Requests":
        return IconBugFilled;
      case "Completed Requests":
        return IconFlagFilled;
      default:
        return IconInfoCircleFilled;
    }
  };

  const getIconColor = (title: string) => {
    switch (title) {
      case "All Requests Queue":
        return "text-blue-600";
      case "New Requests":
        return "text-green-600";
      case "Stale Requests":
        return "text-red-600";
      case "Completed Requests":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const Icon = getIcon(title);
  const IconColor = getIconColor(title);

  return (
    <Card className="relative overflow-hidden">
      {/* Background Icon */}
      <div className={`absolute bottom-0 right-0 transform translate-x-6 translate-y-6 opacity-[0.08]
        ${IconColor}
        `}>
        <Icon size={120} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{count}</p>
          <p className="ml-2 text-sm">Requests</p>
        </div>
        <div className={`mt-1 text-sm ${
          type === "increase" ? "text-green-600" : "text-red-600"
        }`}>
          {type === "increase" ? "+" : "-"}{Math.abs(change)} In this Month
        </div>
      </div>
    </Card>
  );
}