'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronRight, FileText, Printer, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import LoadingSpin from '@/components/ui/LoadingSpin';

interface PurchaseOrder {
  id: string;
  code: string;
  title: string;
  status: string;
  createdAt: string;
  printCount: number;
  documentId?: string;
  user: {
    name: string;
  };
  budget: {
    title: string;
    project: {
      title: string;
    };
  };
  purchaseRequest: {
    code: string;
  };
}

export default function PurchaseOrderList() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/workspace/purchase-orders');
        if (response.ok) {
          const data = await response.json();
          setPurchaseOrders(data.purchaseOrders);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchaseOrders.map((po) => (
        <Card key={po.id}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{po.code}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  po.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                  po.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {po.status}
                </span>
              </div>
              <p className="text-gray-600">{po.title}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>Created by: {po.user.name}</p>
                <p>Project: {po.budget.project.title}</p>
                <p>From PR: {po.purchaseRequest.code}</p>
                <p>Created at: {formatDate(new Date(po.createdAt))}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {po.documentId ? (
                <>
                  <a
                    href={`/api/documents/${po.documentId}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Print"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => window.location.href = `/api/purchase-order/${po.id}/generate`}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Generate Document"
                >
                  <FileText className="w-5 h-5" />
                </button>
              )}
              <Link
                href={`/workspace/purchase-order/${po.id}`}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 