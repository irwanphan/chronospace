'use client';

import { Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function CreateRequestFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8">
      {/* Menu Popup */}
      {isOpen && (
        <div className="absolute bottom-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 w-48 py-2 mb-2">
          <Link 
            href="/purchase-request/new"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
            onClick={() => setIsOpen(false)}
          >
            Purchase Request
          </Link>
          <Link 
            href="/purchase-order/new"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
            onClick={() => setIsOpen(false)}
          >
            Purchase Order
          </Link>
          <Link 
            href="/memo/new"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
            onClick={() => setIsOpen(false)}
          >
            Memo
          </Link>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors"
      >
        {/* change to chevron-down when opened */}
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
} 