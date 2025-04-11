'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import RequestCard from '@/components/RequestCard';
import CreateRequestFAB from '@/components/CreateRequestFAB';
import { formatDate, stripHtmlTags } from '@/lib/utils';
import { WorkspaceAccess } from '@/types/access-control';
import type { Session } from 'next-auth';
import LoadingSpin from '@/components/ui/LoadingSpin';
import WorkspaceStats from './components/WorkspaceStats';
import { calculateRequestStats } from '@/lib/helpers';
import Pagination from '@/components/Pagination';
import { Grid2X2, List, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';

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
      name: string;
    };
  };
  approvalSteps: Array<{
    limit?: number;
  }>;
  viewers: {
    specificUserIds: string[];
    roleIds: string[];
  };
  actors: {
    specificUserId: string;
    roleId: string;
  };
}

type FilterType = 'in-queue' | 'stale' | 'approved' | 'all';

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Early return for loading state
  if (status === 'loading') {
    return <LoadingSpin />;
  }

  // Early return for unauthenticated state
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // If we reach here, we're authenticated
  return <WorkspaceContent session={session} />;
}

function WorkspaceContent({ session }: { session: Session | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [displayAsList, setDisplayAsList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>('in-queue');
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

  const defaultAccess: WorkspaceAccess = {
    createPurchaseRequest: false,
    viewPurchaseRequest: false,
    editPurchaseRequest: false,
    reviewApprovePurchaseRequest: false,
    signDocument: false
  };

  const canCreateRequest: boolean = session?.user?.access?.workspaceAccess?.createPurchaseRequest || defaultAccess.createPurchaseRequest;
  const canViewRequest: boolean = session?.user?.access?.workspaceAccess?.viewPurchaseRequest || defaultAccess.viewPurchaseRequest;
  const canReviewApproveRequest: boolean = session?.user?.access?.workspaceAccess?.reviewApprovePurchaseRequest || defaultAccess.reviewApprovePurchaseRequest;

  const itemsPerPage = displayAsList ? 10 : 6;

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const filterRequests = (requests: PurchaseRequest[]) => {
    switch (activeFilter) {
      case 'in-queue':
        return requests.filter(req => req.status !== 'Approved');
      
      case 'stale':
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return requests.filter(req => {
          const createdDate = new Date(req.createdAt);
          return createdDate < threeDaysAgo && req.status !== 'Approved';
        });
      
      case 'approved':
        return requests.filter(req => req.status === 'Approved');
      
      default:
        return requests;
    }
  };

  // Filter requests first
  const filteredRequests = filterRequests(purchaseRequests);
  
  // Then calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchaseRequests = filteredRequests.slice(startIndex, endIndex);

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
            <Link href="?type=all" className="text-blue-600 px-2 h-8 py-1 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Show All Request
            </Link>
            <Link href="?type=purchase-request" className="text-gray-600 px-2 h-8 py-1 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Purchase Request
            </Link>
            <Link href="?type=purchase-order" className="text-gray-600 px-2 h-8 py-1 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Purchase Order
            </Link>
            <Link href="?type=memo" className="text-gray-600 px-2 h-8 py-1 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300">
              Memo
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* clickable button showing thumbnail and list */}
            <button 
              className={`px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300 ${
                !displayAsList ? 'text-blue-600 border-blue-600' : 'text-gray-600'
              }`} 
              onClick={() => setDisplayAsList(false)}
            >
              <Grid2X2 className="w-5 h-5" />
            </button>
            <button 
              className={`px-2 h-8 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300 ${
                displayAsList ? 'text-blue-600 border-blue-600' : 'text-gray-600'
              }`} 
              onClick={() => setDisplayAsList(true)}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button 
              className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                activeFilter === 'in-queue' 
                  ? 'bg-blue-50 text-blue-600 border-blue-600' 
                  : 'hover:bg-gray-50 border-gray-300'
              }`}
              onClick={() => handleFilterChange('in-queue')}
            >
              In Queue
            </button>
            <button 
              className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                activeFilter === 'stale' 
                  ? 'bg-blue-50 text-blue-600 border-blue-600' 
                  : 'hover:bg-gray-50 border-gray-300'
              }`}
              onClick={() => handleFilterChange('stale')}
            >
              Stale
            </button>
            <button 
              className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                activeFilter === 'approved' 
                  ? 'bg-blue-50 text-blue-600 border-blue-600' 
                  : 'hover:bg-gray-50 border-gray-300'
              }`}
              onClick={() => handleFilterChange('approved')}
            >
              Approved
            </button>
            <button 
              className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-blue-50 text-blue-600 border-blue-600' 
                  : 'hover:bg-gray-50 border-gray-300'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              Show All
            </button>
          </div>
        </div>

        <WorkspaceStats stats={stats} />

        {/* Request List */}
        {displayAsList ? (
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Requestor</th>
                  <th className="text-left p-3">Work Division</th>
                  <th className="text-right p-3">Value</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Submitted At</th>
                  <th className="text-left p-3">Deadline</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPurchaseRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{request.code}</td>
                    <td className="p-3">
                      <div className="font-medium">{request.title}</div>
                      <div className="text-sm text-gray-500">{stripHtmlTags(request.description || '').substring(0, 50)}...</div>
                    </td>
                    <td className="p-3">{request.user.name}</td>
                    <td className="p-3">{request.budget.workDivision.name}</td>
                    <td className="p-3 text-right">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(request.budget.totalBudget)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'Declined' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(request.createdAt)}</td>
                    <td className="p-3">{formatDate(request.budget.project.finishDate) || '-'}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        {canViewRequest && (
                          <button
                            onClick={() => router.push(`/workspace/purchase-request/${request.id}`)}
                            className="px-2 py-1 flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:border-blue-600 border transition-all duration-300 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
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
                  workDivision={request.budget.workDivision.name}
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
                  actors={request.actors}
                />
              );
            })}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={filteredRequests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

      </div>

      {canCreateRequest && (
        <div className="relative">
          <CreateRequestFAB />
        </div>
      )}
    </>
  );
}