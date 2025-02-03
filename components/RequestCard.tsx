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
}: RequestCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">#{id}</span>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
            {type}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Requestor</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full">
              {requestor.avatar && (
                <img 
                  src={requestor.avatar} 
                  alt={requestor.name}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <span className="font-medium">{requestor.name}</span>
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-500">Submitted At {submittedAt}</span>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Work Division</div>
          <div className="font-medium">{workDivision}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Status</div>
          <div className="font-medium text-yellow-600">{status}</div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Overview</div>
        <h4 className="font-medium mb-2">{title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Proposed Value</div>
          <div className="font-medium">{proposedValue}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Deadline</div>
          <div className="font-medium">{deadline}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Attachments</div>
          <div className="font-medium">{attachments}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button 
          onClick={onCheck}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          Check
        </button>
        <button 
          onClick={onDecline}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
        >
          Decline
        </button>
        <button 
          onClick={onApprove}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          Approve
        </button>
      </div>
    </div>
  );
} 