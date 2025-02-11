'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import RequestCard from '@/components/RequestCard';
import CreateRequestFAB from '@/components/CreateRequestFAB';
import StatCard from '@/components/StatCard';
import { useSession } from "next-auth/react";

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const defaultAccess = {
    createPurchaseRequest: false,
    reviewApprovePurchaseRequest: false
  };
  const canCreateRequest = session?.user?.access?.workspaceAccess?.createPurchaseRequest || defaultAccess.createPurchaseRequest;
  const [currentMonth, setCurrentMonth] = useState('Jan 2025');

  console.log('Session:', session); // Debug session
  console.log('Access:', session?.user?.access); // Debug access
  console.log('Can Create:', canCreateRequest); // Debug permission

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Overview</h1>
          <div className="flex items-center gap-2">
            <button className="p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium">{currentMonth}</span>
            <button className="p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
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
          <RequestCard
            id="PR2025010001"
            type="Purchase Request"
            requestor={{
              name: "Nam Do San",
              // avatar: optional
            }}
            submittedAt="8 Jan 2025"
            workDivision="Engineering"
            status="Open"
            title="Diving Equipment For Project X"
            description="Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections."
            proposedValue="Rp 108.000.000"
            deadline="9 Jan 2025"
            attachments={5}
            onCheck={() => console.log('Check clicked')}
            onDecline={() => console.log('Decline clicked')}
            onApprove={() => console.log('Approve clicked')}
          />
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
      
      {status === 'authenticated' && canCreateRequest && <CreateRequestFAB />}
    </>
  );
}