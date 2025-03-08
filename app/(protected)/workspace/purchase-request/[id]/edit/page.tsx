'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

interface PurchaseRequestHistory {
  id: string;
  action: string;
  actor: {
    name: string;
  };
  createdAt: string;
  comment: string;
}

interface PurchaseRequestItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  budgetItem: {
    vendor: {
      vendorName: string;
    };
  };
}

interface PurchaseRequest {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  createdAt: string;
  budget: {
    title: string;
    project: {
      projectCode: string;
      projectTitle: string;
    };
  };
  user: {
    id: string;
    name: string;
    userRoles: {
      role: {
        roleName: string;
      };
    }[];
  };
  items: PurchaseRequestItem[];
  approvalSteps: ApprovalStep[];
  viewers: {
    specificUserIds: string[];
    roleIds: string[];
  };
  approvers: {
    specificUserId: string;
    roleId: string;
  };
}
type ApprovalStep = {
  role: string;
  status: string;
  specificUser: string;
  limit: number;
  duration: number;
  overtimeAction: string;
  stepOrder: number;
  specificUserDetails: {
    name: string;
  };
}

export default function EditRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [histories, setHistories] = useState<PurchaseRequestHistory[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (purchaseRequest?.createdBy === session?.user?.id) {
      setHasAccess(true);
    }
  }, [session, purchaseRequest]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspace/purchase-requests/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPurchaseRequest(data.purchaseRequest);
          setHistories(data.purchaseRequest.histories);
          setTitle(data.purchaseRequest.title);
          setDescription(data.purchaseRequest.description || '');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const response = await fetch(`/api/workspace/purchase-requests/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description
        })
      });

      if (!response.ok) throw new Error('Failed to update');
      
      router.push(`/workspace/purchase-request/${params.id}`);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update request');
    } finally {
      setIsSaving(false);
      router.push(`/workspace/purchase-request/${params.id}`);
    }
  };

  if (!hasAccess) {
    return <div className="flex justify-center items-center h-screen">You don&apos;t have access to this page</div>;
  }

  if (isLoading) {
    return <LoadingSpin />
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Edit Purchase Request</h1>

      { error && <div className="bg-red-500 text-white p-4 rounded-lg">{error}</div> }
      
      <div className="space-y-8">
        {/* Request Info Card */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">
                ID: <span className="font-semibold text-gray-900">{purchaseRequest?.code}</span>
              </div>
              <div className="text-sm text-gray-500">
                Requestor: <span className="font-semibold text-gray-900">{purchaseRequest?.user?.name}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">
                Request Date: <span className="font-semibold text-gray-900">
                  {purchaseRequest?.createdAt ? formatDate(new Date(purchaseRequest.createdAt)) : '-'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Requestor Role: <span className="font-semibold text-gray-900">{purchaseRequest?.user?.userRoles[0]?.role?.roleName}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Request Information</h2>

              <input type="hidden" name="requestCategory" value="Purchase Request" readOnly />

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Related Budget <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={purchaseRequest?.budget.title}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Related Project
                  </label>
                  <input
                    type="text"
                    value={purchaseRequest?.budget.project.projectTitle || ''}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Request Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter request description..."
                />
              </div>

              <h2 className="text-lg font-medium mt-6 mb-4">Item List</h2>
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Unit</th>
                      <th className="text-right p-2">Unit Price</th>
                      <th className="text-right p-2">Total Price</th>
                      <th className="text-left p-2">Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequest?.items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-gray-500">
                          No items selected
                        </td>
                      </tr>
                    ) : purchaseRequest?.items.length === 1 ? (
                      <tr className='border-b'>
                        <td className="p-2">{1}</td>
                        <td className="p-2">{purchaseRequest?.items[0].description}</td>
                        <td className="p-2">{purchaseRequest?.items[0].qty}</td>
                        <td className="p-2">{purchaseRequest?.items[0].unit}</td>
                        <td className="p-2 text-right">
                          {new Intl.NumberFormat('id-ID').format(purchaseRequest?.items[0].unitPrice)}
                        </td>
                        <td className="p-2 text-right">
                          {new Intl.NumberFormat('id-ID').format(purchaseRequest?.items[0].qty * purchaseRequest?.items[0].unitPrice)}
                        </td>
                        <td className="p-2">{purchaseRequest?.items[0].budgetItem.vendor.vendorName}</td>
                      </tr>
                    ) : (
                      purchaseRequest?.items.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2">{item.qty}</td>
                          <td className="p-2">{item.unit}</td>
                          <td className="p-2 text-right">
                            {new Intl.NumberFormat('id-ID').format(item.unitPrice)}
                          </td>
                          <td className="p-2 text-right">
                            {new Intl.NumberFormat('id-ID').format(item.qty * item.unitPrice)}
                          </td>
                          <td className="p-2">{item.budgetItem.vendor.vendorName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <hr className="my-6" />

              <h2 className="text-lg font-medium">Approval Steps</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Specific User</th>
                      <th className="text-left py-3 px-4">Limit</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Overtime</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequest?.approvalSteps.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          No steps added yet
                        </td>
                      </tr>
                    ) : (
                      purchaseRequest?.approvalSteps.map((step, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">{step.role}</td>
                          <td className="py-3 px-4">{step.specificUserDetails?.name || 'Any user with role'}</td>
                          <td className="py-3 px-4">{formatCurrency(step.limit) || '-'}</td>
                          <td className="py-3 px-4">{step.duration} days</td>
                          <td className="py-3 px-4">
                            {step.overtimeAction === 'Notify and Wait' ? 'Notify and Wait' : 'Auto Decline'}
                          </td>
                          <td className="py-3 px-4">
                            {step.status === 'Pending' ? (
                              <span className="text-yellow-500 p-1 border border-yellow-500 rounded-lg bg-yellow-50">{step.status}</span>
                            ) : step.status === 'Approved' ? (
                              <span className="text-green-500 p-1 border border-green-500 rounded-lg bg-green-50">{step.status}</span>
                            ) : (
                              <span className="text-red-500 p-1 border border-red-500 rounded-lg bg-red-50">{step.status}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="my-6" />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
                onClick={() => router.push(`/workspace/purchase-request/${params.id}`)}
              >
                <ChevronLeft className='w-4 h-4 mr-2' />Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>

      {histories.length > 0 && (
        <PurchaseRequestHistory histories={histories} />
      )}
    </div>
  );
}

function PurchaseRequestHistory({ histories }: { histories: PurchaseRequestHistory[] }) {
  return (
    <div className="rounded-lg p-6 mb-6 border border-gray-200 bg-white">
      <h2 className="text-lg font-medium mb-4">Request History</h2>
      <div className="space-y-2">
        {histories.map((history) => (
          <div key={history.id} className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">
              Request <span className="font-semibold">{history.action.toLowerCase()}</span> by{' '}
              <span className="font-semibold">{history.actor.name}</span> on{' '}
              {formatDate(new Date(history.createdAt))}
            </p>
            {history.comment && (
              <p className="text-sm text-gray-600 mt-1">&quot;{history.comment}&quot;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 