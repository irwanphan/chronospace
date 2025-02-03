interface StatCardProps {
  title: string;
  count: number;
  change: number;
  type?: 'increase' | 'decrease';
}

export default function StatCard({ title, count, change, type = 'increase' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-2">{count} Requests</div>
      <div className={`text-sm ${type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
        <span className="font-medium">{change > 0 ? `+${change}` : change}</span> In this Month
      </div>
    </div>
  );
} 