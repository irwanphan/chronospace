'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import RequestCard from '@/components/RequestCard';
import CreateRequestFAB from '@/components/CreateRequestFAB';
import { formatDate, stripHtmlTags } from '@/lib/utils';
import { WorkspaceAccess } from '@/types/access-control';
import { Session } from 'next-auth';
import LoadingSpin from '@/components/ui/LoadingSpin';
import WorkspaceStats from './components/WorkspaceStats';
import { calculateRequestStats } from '@/lib/helpers';
import Pagination from '@/components/Pagination';
import { Grid2X2, List } from 'lucide-react';

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
    id: string;
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
  viewers: {
    specificUserIds: string[];
    roleIds: string[];
  };
  approvers: {
    specificUserId: string;
    roleId: string;
  };
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
  const [stats, setStats] = useState({
    allRequests: 0,
    newRequests: 0,
    staleRequests: 0,
    completedRequests: 0,
    allRequestsChange: 0,
    newRequestsChange: 0,
    staleRequestsChange: 0,
    completedRequestsChange: 0
  });

  const [displayAsList, setDisplayAsList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = displayAsList ? 10 : 6;
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchaseRequests = purchaseRequests.slice(startIndex, endIndex);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/workspace');
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        
        if (mounted) {
          setPurchaseRequests(data.purchaseRequests);
          setStats(calculateRequestStats(data.purchaseRequests));
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
      mounted = false;
    };
  }, []);

  // console.log('Purchase Requests:', purchaseRequests);
  if (isLoading) return <LoadingSpin />

  return (
    <>
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Overview</h1>
        </div>

        { error && (
          <div className="mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-row gap-4 border-b border-gray-200 mb-4 justify-between">
          <div className="flex items-center gap-4">
            <Link href="?type=all" className="text-blue-600 px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Show All Request
            </Link>
            <Link href="?type=purchase-request" className="text-gray-600 px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Purchase Request
            </Link>
            <Link href="?type=purchase-order" className="text-gray-600 px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Purchase Order
            </Link>
            <Link href="?type=memo" className="text-gray-600 px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Memo
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* clickable button showing thumbnail and list */}
            <button className={`text-gray-600 px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300 ${!displayAsList ? 'text-blue-600' : 'text-gray-600'}`} 
              onClick={() => setDisplayAsList(false)}>
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button className={`text-gray-600 px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300 ${displayAsList ? 'border-blue-600' : 'border-transparent'}`} 
              onClick={() => setDisplayAsList(true)}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
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

        <WorkspaceStats stats={stats} />

        {/* Request List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPurchaseRequests.map((request) => {
            return (
              <RequestCard
                key={request.id}
                code={request.code}
                type='Purchase Request'
                requestor={{id: request.user.id, name: request.user.name}}
                currentUserId={session?.user?.id || ''}
                currentUserRole={session?.user?.roleId || ''}
                submittedAt={formatDate(request.createdAt) || 'No submission date'}
                workDivision={request.budget.workDivision.divisionName}
                status={request.status}
                title={request.title}
                description={stripHtmlTags(request.description || '')}
                proposedValue={`Rp ${new Intl.NumberFormat('id-ID').format(
                  request.budget.totalBudget
                )}`}
                deadline={formatDate(request.budget.project.finishDate) || 'No deadline'}
                attachments={0}
                canCheck={canViewRequest}
                onCheck={() => router.push(`/workspace/purchase-request/${request.id}`)}
                canReview={canReviewApproveRequest}
                reviewers={request.viewers}
                approvers={request.approvers}
              />
            );
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={purchaseRequests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

      </div>

      {status === 'authenticated' && canCreateRequest && (
        <div className="relative">
          <CreateRequestFAB />
        </div>
      )}
    </>
  );
}