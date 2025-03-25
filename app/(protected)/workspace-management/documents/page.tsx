'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import LoadingSpin from '@/components/ui/LoadingSpin';

interface Documents {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: string;
  usages: {
    entityType: string;
    entityId: string;
    entityCode: string;
    entityTitle: string;
  }[];
}

const entityRoutes = {
  'PROJECT': 'project-planning',
  'BUDGET': 'budget-planning',
  'PURCHASE_REQUEST': 'workspace/purchase-request'
} as const;

export default function DocumentPage() {
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/workspace-management/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpin />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Document Management</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Document Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Uploaded By</th>
                <th className="px-4 py-2 text-left">Upload Date</th>
                <th className="px-4 py-2 text-left">Used In</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      {doc.fileName}
                    </div>
                  </td>
                  <td className="px-4 py-2">{doc.fileType}</td>
                  <td className="px-4 py-2">{doc.uploadedBy}</td>
                  <td className="px-4 py-2">{formatDate(doc.uploadedAt)}</td>
                  <td className="px-4 py-2">
                    <div className="space-y-1">
                      {doc.usages.map((usage, index) => (
                        <div key={index} className="flex items-center gap-1 text-sm">
                          <span className="font-medium">{usage.entityType}:</span>
                          <a
                            href={`/${entityRoutes[usage.entityType as keyof typeof entityRoutes]}/${usage.entityId}`}
                          >
                            {usage.entityCode}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 