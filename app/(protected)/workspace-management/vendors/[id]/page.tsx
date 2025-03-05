'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Vendor } from '@prisma/client';
import LoadingSpin from '@/components/ui/LoadingSpin';

export default function ViewVendorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    vendorCode?: string;
    general?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/workspace-management/vendors/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const vendorData = await response.json();
        setVendor(vendorData);
        // setExistingDocuments(vendorData.documents || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ general: 'Failed to load vendor data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) return <LoadingSpin />

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">View Vendor</h1>
      
      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <form className="space-y-6 border border-gray-200 rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Vendor Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={vendor?.vendorCode}
            className="w-full px-4 py-2 border rounded-lg"
            readOnly
          />
          {errors.vendorCode && (
            <p className="mt-1 text-sm text-red-600">{errors.vendorCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vendor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={vendor?.vendorName}
            className="w-full px-4 py-2 border rounded-lg"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vendor Address
          </label>
          <div 
            className="w-full px-4 py-2 border rounded-lg"
            dangerouslySetInnerHTML={{ __html: vendor?.address || '' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={vendor?.phone}
              className="w-full px-4 py-2 border rounded-lg"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={vendor?.email}
              className="w-full px-4 py-2 border rounded-lg"
              readOnly
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Supporting Documents
          </label>
          <div className="mt-1">
            <span className="ml-3 text-gray-500">
              {vendor!.documents!.length > 0 
                ? `${vendor!.documents!.length} files selected` 
                : 'No document uploaded'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/workspace-management/vendors')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            onClick={() => router.push(`/workspace-management/vendors/${params.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </form>
    </div>
  );
} 