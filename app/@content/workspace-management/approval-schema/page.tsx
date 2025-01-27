'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { ApprovalSchema } from '@/types/approvalSchema';

export default function ApprovalSchemaPage() {
  const [schemas, setSchemas] = useState<ApprovalSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/approval-schemas');
      if (!response.ok) {
        throw new Error('Failed to fetch approval schemas');
      }
      const data = await response.json();
      setSchemas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch approval schemas:', error);
      setError('Failed to load approval schemas');
      setSchemas([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <Link
            href="/workspace-management/approval-schema/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Schema
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : schemas.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No approval schemas found
          </div>
        ) : (
          schemas.map((schema) => (
            <div key={schema.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{schema.name}</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Document Type:</span> {schema.documentType}
                </div>
                <div>
                  <span className="font-medium">Work Division:</span> {schema.workDivision}
                </div>
                {schema.documentType === 'Purchase Request' && (
                  <div>
                    <span className="font-medium">Budget Limit:</span>{' '}
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(schema.budgetLimit || 0)}
                  </div>
                )}
                {schema.description && (
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span> {schema.description}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 