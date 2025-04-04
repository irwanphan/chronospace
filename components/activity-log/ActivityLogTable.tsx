import { format } from 'date-fns';
import { Prisma } from '@prisma/client';

type ActivityDetails = Prisma.JsonValue;

interface Activity {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  entityCode: string | null;
  action: string;
  details: ActivityDetails;
  timestamp: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface ActivityLogTableProps {
  activities: Activity[];
}

export default function ActivityLogTable({ activities }: ActivityLogTableProps) {
  return (
    <div className="grid overflow-x-auto max-h-[calc(100vh-15rem)]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-100 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(activity.timestamp), 'PPpp')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{activity.user.name}</div>
                <div className="text-sm text-gray-500">{activity.user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${getActionColor(activity.action)}`}>
                  {activity.action}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{activity.entityType}</div>
                <div className="text-sm text-gray-500">{activity.entityCode || activity.entityId}</div>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(activity.details, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getActionColor(action: string): string {
  switch (action.toUpperCase()) {
    case 'CREATE':
      return 'bg-green-100 text-green-800';
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    case 'APPROVE':
      return 'bg-green-100 text-green-800';
    case 'REJECT':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 