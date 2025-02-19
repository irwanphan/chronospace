import { getInitials } from "@/lib/utils";
import Image from "next/image";
import Avatar from "./ui/Avatar";

interface RequestCardProps {
  id: string;
  type: string;
  requestor: {
    name: string;
    avatar?: string;
  };
  submittedAt: string;
  workDivision: string;
  status: string;
  title: string;
  description: string;
  proposedValue: string;
  deadline: string;
  attachments: number;
  onCheck?: () => void;
  onDecline?: () => void;
  onApprove?: () => void;
  canCheck?: boolean;
  canDecline?: boolean;
  canApprove?: boolean;
}

export default function RequestCard({
  id,
  type,
  requestor,
  submittedAt,
  workDivision,
  status,
  title,
  description,
  proposedValue,
  deadline,
  attachments,
  onCheck,
  onDecline,
  onApprove,
  canCheck,
  canDecline,
  canApprove,
}: RequestCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex justify-between items-center gap-2 w-full">
          <span className="text-xs font-medium">#{id}</span>
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
          <div className="font-medium text-yellow-600">{status}</div>
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
        {canCheck && (
          <button 
            onClick={onCheck}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            Check
          </button>
        )}
        {canDecline && (
          <button 
            onClick={onDecline}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            Decline
          </button>
        )}
        {canApprove && (
          <button 
            onClick={onApprove}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
} 