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
import { toast } from 'react-hot-toast';

interface PurchaseRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  items: Array<{
    qty: number;
    unitPrice: number;
  }>;
  budget: {
    division: string;
  };
  approvalSteps: Array<{
    limit?: number;
  }>;
}

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const defaultAccess = {
    createPurchaseRequest: false,
    reviewApprovePurchaseRequest: false
  };
  const canCreateRequest = session?.user?.access?.workspaceAccess?.createPurchaseRequest || defaultAccess.createPurchaseRequest;
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  console.log('purchaseRequests ', purchaseRequests)

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
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/purchase-requests');
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        setPurchaseRequests(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load requests');
      }
    };

    fetchRequests();
  }, []);

  console.log('Session:', session); // Debug session
  console.log('Access:', session?.user?.access); // Debug access
  console.log('Can Create:', canCreateRequest); // Debug permission

  return (
    <>
      <div className="max-w-7xl">
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
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchaseRequests.map((request) => (
            <RequestCard
              key={request.id}
              id={request.id}
              type="Purchase Request"
              requestor={{
                name: session?.user?.name || 'Unknown User',
              }}
              submittedAt={new Date(request.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
              workDivision={request.budget.division}
              status={request.status}
              title={request.title}
              description={request.description || ''}
              proposedValue={`Rp ${new Intl.NumberFormat('id-ID').format(
                request.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0)
              )}`}
              deadline={request.approvalSteps[0]?.limit ? 
                new Date(Date.now() + request.approvalSteps[0].limit * 60 * 60 * 1000).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 
                'No deadline'
              }
              attachments={0}
              onCheck={() => console.log('Check clicked', request.id)}
              onDecline={() => console.log('Decline clicked', request.id)}
              onApprove={() => console.log('Approve clicked', request.id)}
            />
          ))}
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