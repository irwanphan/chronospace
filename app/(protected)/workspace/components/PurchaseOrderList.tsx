'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ChevronRight, FileText, Printer, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { useUserAccess } from '@/hooks/useUserAccess';

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

export default function PurchaseOrderList(
  {
    displayAsList,
  }: {
    displayAsList: boolean;
  }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const canGenerateDocument = useUserAccess('workspaceAccess', 'generatePurchaseOrderDocument');
  const canViewPurchaseOrder = useUserAccess('workspaceAccess', 'viewPurchaseOrder');

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

  if (purchaseOrders.length === 0) {
    return (
      <div className="flex p-3">
        <p className="text-gray-500">No purchase orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {displayAsList ? (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Created By</th>
                <th className="text-left p-3">Project</th>
                <th className="text-left p-3">PR Code</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created At</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{po.code}</td>
                  <td className="p-3">{po.title}</td>
                  <td className="p-3">{po.user.name}</td>
                  <td className="p-3">{po.budget.project.title}</td>
                  <td className="p-3">{po.purchaseRequest.code}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      po.documentId ? 'bg-blue-100 text-blue-800' :
                      po.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                      po.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(po.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex justify-center items-center gap-2">
                      {po.documentId ? (
                        <>
                          <a
                            href={`/api/documents/${po.documentId}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                              disabled:hover:border-red-500 border border-transparent hover:border-gray-600 border-1
                              disabled:cursor-not-allowed"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => window.print()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                              disabled:hover:border-red-500 border border-transparent hover:border-gray-600 border-1
                              disabled:cursor-not-allowed"
                            title="Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => window.location.href = `/api/workspace/purchase-orders/${po.id}/generate`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                            disabled:hover:border-red-500 border border-transparent border-1
                            disabled:cursor-not-allowed"
                          title="Generate Document"
                          disabled={!canGenerateDocument}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {canViewPurchaseOrder && (
                        <Link
                          href={`/workspace/purchase-order/${po.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                          border border-transparent hover:border-gray-600 border-1"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
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
          {purchaseOrders.map((po) => (
            <Card key={po.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{po.code}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      po.documentId ? 'bg-blue-100 text-blue-800' :
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
                    <p>Created at: {formatDate(po.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {po.documentId ? (
                    <>
                      <a
                        href={`/api/documents/${po.documentId}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                          disabled:hover:border-red-500 border border-transparent hover:border-gray-600 border-1
                          disabled:cursor-not-allowed"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => window.print()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                          disabled:hover:border-red-500 border border-transparent hover:border-gray-600 border-1
                          disabled:cursor-not-allowed"
                        title="Print"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => window.location.href = `/api/workspace/purchase-orders/${po.id}/generate`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                        disabled:hover:border-red-500 
                        border border-transparent hover:border-gray-600 border-1
                        disabled:cursor-not-allowed"
                      title="Generate Document"
                      disabled={!canGenerateDocument}
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  )}
                  {canViewPurchaseOrder && (
                    <Link
                      href={`/workspace/purchase-order/${po.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                        border border-transparent hover:border-gray-600 border-1"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 