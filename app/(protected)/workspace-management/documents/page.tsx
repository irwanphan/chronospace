'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import LoadingSpin from '@/components/ui/LoadingSpin';

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
  size: number;
  uploadedBy: string;
  usages: {
    entityType: string;
    entityId: string;
    entityCode: string;
    entityTitle: string;
  }[];
  isOrphan: boolean;
}

const entityRoutes = {
  'PROJECT': 'project-planning',
  'BUDGET': 'budget-planning',
  'PURCHASE_REQUEST': 'workspace/purchase-request'
} as const;

export default function DocumentPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Document Management</h1>
        <div className="text-sm text-gray-500">
          Total Files: {documents.length} | 
          Unused Files: {documents.filter(d => d.isOrphan).length}
        </div>
      </div>

      <Card className="mb-8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Document Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Size</th>
              <th className="px-4 py-2 text-left">Uploaded By</th>
              <th className="px-4 py-2 text-left">Upload Date</th>
              {/* <th className="px-4 py-2 text-left">Status</th> */}
              <th className="px-4 py-2 text-left">Used In</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className={`border-b hover:bg-blue-50 ${doc.isOrphan ? 'bg-gray-100' : ''}`}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    {doc.fileName}
                  </div>
                </td>
                <td className="px-4 py-2">{doc.fileType}</td>
                <td className="px-4 py-2">{formatBytes(doc.size)}</td>
                <td className="px-4 py-2">{doc.uploadedBy}</td>
                <td className="px-4 py-2">{formatDate(doc.uploadedAt)}</td>
                {/* <td className="px-4 py-2">
                  {doc.isOrphan ? (
                    <span className="text-red-600">Unused</span>
                  ) : (
                    <span className="text-green-600">In Use</span>
                  )}
                </td> */}
                <td className="px-4 py-2">
                  {doc.usages.length > 0 ? (
                    <div className="space-y-1">
                      {doc.usages.map((usage, index) => (
                        <div key={index} className="flex items-center gap-1 text-sm">
                          <span className="font-medium">{usage.entityType}:</span>
                          <a
                            href={`/${entityRoutes[usage.entityType as keyof typeof entityRoutes]}/${usage.entityId}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {usage.entityCode}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {doc.fileType === 'PDF' && (
                      <a
                        href={doc.isOrphan ? 
                          `/workspace-management/documents/view?url=${encodeURIComponent(doc.fileUrl)}` :
                          `/workspace-management/documents/${doc.id}`
                        }
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        Sign
                      </a>
                    )}
                    {doc.isOrphan && (
                      <button
                        // onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {/* Delete */}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// Helper function untuk format ukuran file
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 