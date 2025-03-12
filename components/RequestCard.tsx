import { getInitials } from "@/lib/utils";
import Image from "next/image";
import Avatar from "./ui/Avatar";
import { ScanSearch } from "lucide-react";
import Card from "./ui/Card";

interface RequestCardProps {
  code: string;
  type: string;
  requestor: {
    id: string;
    name: string;
    avatar?: string;
  };
  currentUserId: string;
  currentUserRole: string;
  submittedAt: string;
  workDivision: string;
  status: string;
  title: string;
  description: string;
  proposedValue: string;
  deadline: string;
  attachments: number;
  onCheck?: () => void;
  canCheck?: boolean;
  canReview?: boolean;
  reviewers?: {
    specificUserIds: string[];
    roleIds: string[];
  };
  actors?: {
    specificUserId: string;
    roleId: string;
  };
}

export default function RequestCard({
  code,
  type,
  requestor,
  currentUserId,
  currentUserRole,
  submittedAt,
  workDivision,
  status,
  title,
  description,
  proposedValue,
  deadline,
  attachments,
  onCheck,
  canCheck,
  canReview,
  reviewers,
  actors,
}: RequestCardProps) {

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex justify-between items-center gap-2 w-full">
          <span className="text-xs font-medium">#{code}</span>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
            {type}
          </span>
        </div>
      </div>

      <hr className="my-4" />

      <div className="grid grid-cols-2 gap-8 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full">
              {requestor.avatar ? (
                <Image
                  src={requestor.avatar} 
                  alt={requestor.name}
                  width={40}
                  height={40}
                  className="rounded-full overflow-hidden bg-gray-200"
                />
              ) : (
                <Avatar>
                  {getInitials(requestor.name)}
                </Avatar>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Requestor</div>
              <span className="font-medium">{requestor.name}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Submitted At</div>
          <div className="font-medium">{submittedAt}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Work Division</div>
          <div className="font-medium">{workDivision}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <div className={`font-medium 
            ${status === 'Approved' ? 'text-green-600'
            : status === 'Declined' ? 'text-red-600'
            : 'text-yellow-600'}`}>
            {status}
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Overview</div>
        <h4 className="font-medium mb-2">{title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1 mb-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">Proposed Value</div>
          <div className="text-sm font-medium">{proposedValue}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Deadline</div>
          <div className="text-sm font-medium">{deadline}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Attachments</div>
          <div className="text-sm font-medium">{attachments}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {/* if any of the reviewers is current users */}
        { canCheck && 
          ( reviewers?.specificUserIds.includes(currentUserId) || reviewers?.roleIds.includes(currentUserRole) || requestor.id === currentUserId) && (
            <button 
              onClick={onCheck}
              type="button"
              className={`px-4 py-2 border rounded-lg flex items-center gap-1 
              ${canReview && 
                ( actors?.specificUserId === currentUserId || 
                  actors?.roleId === currentUserRole) ? 
                  'bg-blue-600 text-white hover:bg-blue-700' : 
                  'bg-white hover:bg-gray-50'}`}
          >
            <ScanSearch className="w-5 h-5" />
              Check {canReview && 
                ( actors?.specificUserId === currentUserId || 
                  actors?.roleId === currentUserRole) && 
                  '& Review'}
          </button>
        )}
      </div>
    </Card>
  );
} 