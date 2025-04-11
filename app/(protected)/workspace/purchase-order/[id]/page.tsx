'use client';

import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { stripHtmlTags } from '@/lib/utils';
import { ChevronLeft, Download, Printer } from 'lucide-react';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
// import { Modal } from '@/components/ui/Modal';

interface PurchaseOrderHistory {
  id: string;
  action: string;
  actor: {
    name: string;
  };
  createdAt: string;
  comment: string;
}

interface PurchaseOrderItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendor: {
    vendorName: string;
  };
}

interface PurchaseOrder {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  printCount: number;
  items: PurchaseOrderItem[];
  budget: {
    title: string;
    project: {
      title: string;
      finishDate: string;
    };
  };
  user: {
    name: string;
    userRoles: {
      role: {
        roleName: string;
      };
    }[];
  };
  histories: PurchaseOrderHistory[];
  purchaseRequest: {
    code: string;
    histories: PurchaseOrderHistory[];
  };
}

export default function ViewPurchaseOrderPage({ params }: { params: { id: string } }) {
  // const router = useRouter();
  // const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspace/purchase-orders/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPurchaseOrder(data.purchaseOrder);
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

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      
      // First increment the print count
      const response = await fetch(`/api/workspace/purchase-orders/${params.id}/increment-print-count`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to update print count');
      }

      // Then trigger print
      window.print();

      // Refresh the data to get updated print count
      const refreshResponse = await fetch(`/api/workspace/purchase-orders/${params.id}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setPurchaseOrder(data.purchaseOrder);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to print document');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // First increment the print count
      const response = await fetch(`/api/workspace/purchase-orders/${params.id}/increment-print-count`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to update print count');
      }

      // Then trigger download
      const downloadResponse = await fetch(`/api/workspace/purchase-orders/${params.id}/download`);
      if (!downloadResponse.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${purchaseOrder?.code || 'purchase-order'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh the data to get updated print count
      const refreshResponse = await fetch(`/api/workspace/purchase-orders/${params.id}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setPurchaseOrder(data.purchaseOrder);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to download document');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <LoadingSpin />;

  return (
    <div>
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mb-4">Purchase Order Details</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 border rounded-lg flex items-center hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 border rounded-lg flex items-center hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500 text-white p-4 rounded-lg">{error}</div>}

        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">
                PO Code: <span className="font-semibold text-gray-900">{purchaseOrder?.code}</span>
              </div>
              <div className="text-sm text-gray-500">
                Created By: <span className="font-semibold text-gray-900">{purchaseOrder?.user?.name}</span>
              </div>
              <div className="text-sm text-gray-500">
                From PR: <Link href={`/workspace/purchase-request/${purchaseOrder?.purchaseRequest?.code}`} className="font-semibold text-blue-600 hover:underline">
                  {purchaseOrder?.purchaseRequest?.code}
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">
                Created At: <span className="font-semibold text-gray-900">
                  {purchaseOrder?.createdAt ? formatDate(new Date(purchaseOrder.createdAt)) : '-'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Print Count: <span className="font-semibold text-gray-900">{purchaseOrder?.printCount || 0}</span>
              </div>
              <div className="text-sm text-gray-500">
                Status: <span className={`font-semibold ${
                  purchaseOrder?.status === 'Draft' ? 'text-yellow-600' :
                  purchaseOrder?.status === 'Approved' ? 'text-green-600' :
                  'text-gray-900'
                }`}>{purchaseOrder?.status}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Related Budget</label>
                <input
                  type="text"
                  value={purchaseOrder?.budget?.title || ''}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Related Project</label>
                <input
                  type="text"
                  value={purchaseOrder?.budget?.project?.title || ''}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  disabled
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Order Title</label>
              <input
                type="text"
                value={purchaseOrder?.title || ''}
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <div className="px-4 py-2 border rounded-lg bg-gray-100">
                {stripHtmlTags(purchaseOrder?.description || '')}
              </div>
            </div>

            <h2 className="text-lg font-medium mt-6 mb-4">Item List</h2>
            <div className="overflow-x-auto">
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
                  {purchaseOrder?.items.map((item, index) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.qty}</td>
                      <td className="p-2">{item.unit}</td>
                      <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.qty * item.unitPrice)}</td>
                      <td className="p-2">{item.vendor?.vendorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="my-6" />
            <div className="flex justify-end gap-2">
              <Link
                href="/workspace"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />Back
              </Link>
            </div>
          </div>            
        </Card>

        <Card>
          <div className="space-y-6"></div>
            <h2 className="text-lg font-medium mt-6 mb-4">History</h2>
            <div className="space-y-4">
              {/* PR History */}
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Purchase Request History</h3>
                <div className="space-y-2">
                  {purchaseOrder?.purchaseRequest?.histories.map((history) => (
                    <div key={history.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{history.actor.name}</span>
                          {' '}
                          <span className="text-gray-500">{history.action}</span>
                        </p>
                        {history.comment && (
                          <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(history.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PO History */}
              <div>
                <h3 className="text-md font-medium mb-2">Purchase Order History</h3>
                <div className="space-y-2">
                  {purchaseOrder?.histories.map((history) => (
                    <div key={history.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{history.actor.name}</span>
                          {' '}
                          <span className="text-gray-500">{history.action}</span>
                        </p>
                        {history.comment && (
                          <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(history.createdAt)}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

        </Card>
      </div>
    </div>
  );
} 