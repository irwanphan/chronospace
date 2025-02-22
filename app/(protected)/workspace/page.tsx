'use client';

// import { useState } from 'react';
import { useEffect, useState } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import RequestCard from '@/components/RequestCard';
import CreateRequestFAB from '@/components/CreateRequestFAB';
import StatCard from '@/components/StatCard';
import { formatDate, stripHtmlTags } from '@/lib/utils';
// import { WorkDivision } from '@/types/workDivision';
import { WorkspaceAccess } from '@/types/access-control';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    access: {
      workspaceAccess: WorkspaceAccess;
    };
  } & Session['user'];
}

interface PurchaseRequest {
  id: string;
  code: string;
  title: string;
  documentType: string;
  description?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  items: Array<{
    qty: number;
    unitPrice: number;
  }>;
  user: {
    name: string;
  };
  budget: {
    id: string;
    totalBudget: number;
    project: {
      finishDate: string;
    };
    workDivision: {
      divisionName: string;
    };
  };
  approvalSteps: Array<{
    limit?: number;
  }>;
}

export default function WorkspacePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const { data: session, status } = useSession() as { 
    data: CustomSession | null, 
    status: 'loading' | 'authenticated' | 'unauthenticated' 
  };
  const defaultAccess: WorkspaceAccess = {
    createPurchaseRequest: false,
    viewPurchaseRequest: false,
    editPurchaseRequest: false,
    reviewApprovePurchaseRequest: false
  };
  const canCreateRequest: boolean = session?.user?.access?.workspaceAccess?.createPurchaseRequest || defaultAccess.createPurchaseRequest;
  const canViewRequest: boolean = session?.user?.access?.workspaceAccess?.viewPurchaseRequest || defaultAccess.viewPurchaseRequest;
  const canReviewApproveRequest: boolean = session?.user?.access?.workspaceAccess?.reviewApprovePurchaseRequest || defaultAccess.reviewApprovePurchaseRequest;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Shortcut: Ctrl/Cmd + Shift + N
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        if (canCreateRequest) {
          router.push('/request/new');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canCreateRequest, router]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/workspace');
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        
        if (mounted) {  // Hanya update state jika komponen masih mounted
          setPurchaseRequests(data.purchaseRequests);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        if (mounted) {
          setError('Failed to load requests');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;  // Cleanup saat unmount
    };
  }, []); // Empty dependency array

  // console.log('Purchase Requests:', purchaseRequests);

  if (isLoading) {
    return <div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-screen">
        <div className="w-20 h-20 border-t-2 border-b-2 border-blue-900 rounded-full animate-spin"></div>
      </div>
    </div>;
  }

  return (
    <>
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Overview</h1>
          {/* <div className="flex items-center gap-2">
            <button className="p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium">{currentMonth}</span>
            <button className="p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div> */}
        </div>

        { error && (
          <div className="mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="?type=all" className="text-blue-600 hover:underline">
              Show All Request
            </Link>
            <Link href="?type=purchase-request" className="text-gray-600 hover:underline">
              Purchase Request
            </Link>
            <Link href="?type=purchase-order" className="text-gray-600 hover:underline">
              Purchase Order
            </Link>
            <Link href="?type=memo" className="text-gray-600 hover:underline">
              Memo
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm">
              In Queue
            </button>
            <button className="px-4 py-2 hover:bg-gray-50 rounded-full text-sm">
              Stale
            </button>
            <button className="px-4 py-2 hover:bg-gray-50 rounded-full text-sm">
              Approved
            </button>
            <button className="px-4 py-2 hover:bg-gray-50 rounded-full text-sm">
              Show All
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="All Requests Queue"
            count={40}
            change={8}
            type="increase"
          />
          <StatCard
            title="New Requests"
            count={28}
            change={8}
            type="increase"
          />
          <StatCard
            title="Stale Requests"
            count={12}
            change={2}
            type="decrease"
          />
          <StatCard
            title="Completed Requests"
            count={30}
            change={9}
            type="increase"
          />
        </div>

        {/* Request List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchaseRequests.map((request) => {
            return (
              <RequestCard
                key={request.id}
                code={request.code}
                type='Purchase Request'
                requestor={{
                  name: request.user.name,
                }}
                submittedAt={new Date(request.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
                workDivision={request.budget.workDivision.divisionName}
                status={request.status}
                title={request.title}
                description={stripHtmlTags(request.description || '')}
                // proposedValue={`Rp ${new Intl.NumberFormat('id-ID').format(
                //   request.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0)
                // )}`}
                proposedValue={`Rp ${new Intl.NumberFormat('id-ID').format(
                  request.budget.totalBudget
                )}`}
                // deadline={request.approvalSteps[0]?.limit ? 
                //   new Date(Date.now() + request.approvalSteps[0].limit * 60 * 60 * 1000).toLocaleDateString('en-US', {
                //     day: 'numeric',
                //     month: 'short',
                //     year: 'numeric'
                //   }) : 
                //   'No deadline'
                // }
                deadline={formatDate(request.budget.project.finishDate) || 'No deadline'}
                attachments={0}
                canCheck={canViewRequest}
                // canDecline={canReviewApproveRequest}
                // canApprove={canReviewApproveRequest}
                onCheck={() => router.push(`/workspace/purchase-request/${request.id}`)}
                // onDecline={() => {}}
                // onApprove={() => {}}
                canReview={canReviewApproveRequest}
              />
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50">
            4
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50">
            5
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50">
            6
          </button>
        </div>
      </div>
      
      {status === 'authenticated' && canCreateRequest && (
        <div className="relative">
          <CreateRequestFAB />
          {/* <div className="fixed bottom-16 right-4 text-sm text-gray-500">
            Press Ctrl+Shift+N
          </div> */}
        </div>
      )}
    </>
  );
}