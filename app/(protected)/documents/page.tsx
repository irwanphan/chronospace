'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/utils';
import { FileText, Download, ExternalLink, Trash2, Upload, X } from 'lucide-react';
import { IconFileSearch } from '@tabler/icons-react';
import Card from '@/components/ui/Card';
import LoadingSpin from '@/components/ui/LoadingSpin';

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  downloadUrl: string;
  fileType: string;
  uploadedAt: Date;
  size: number;
  uploadedBy: string;
  uploader: {
    name: string;
  };
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
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingFileUrl, setDeletingFileUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      setDeletingFileUrl(fileUrl);
      const response = await fetch(`/api/documents/${encodeURIComponent(fileUrl)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete document');
    } finally {
      setDeletingFileUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
      setIsModalOpen(false);
    }
  };

  if (isLoading) return <LoadingSpin />;

  return (
    <>
      {
        deletingFileUrl && (
          <div className="fixed inset-0 flex items-center justify-center bg-blue-500 bg-opacity-10 z-50">
            <LoadingSpin />
          </div>
        )
      }
    
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Uploaded Documents</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Total Files: {documents.length} | 
              Unused Files: {documents.filter(d => d.isOrphan).length}
            </div>
            {session?.user?.access.activityAccess.uploadDocument && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            )}
          </div>
        </div>

        <Card className="mb-8 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Document Name</th>
                {/* <th className="px-4 py-2 text-left">Type</th> */}
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
                      <FileText className="w-4 h-4 text-gray-500 self-start"/>
                      <p className="text-sm">{doc.fileName}</p>
                    </div>
                  </td>
                  {/* <td className="px-4 py-2">{doc.fileType}</td> */}
                  <td className="px-4 py-2">{formatBytes(doc.size)}</td>
                  <td className="px-4 py-2">{doc.uploader.name}</td>
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
                      {session?.user?.access.activityAccess.downloadDocument && (
                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {doc.fileType === 'PDF' && (
                        <a
                          href={
                            // doc.isOrphan ? 
                            `/documents/view?url=${encodeURIComponent(doc.fileUrl)}` 
                            // :
                            // `/documents/${doc.id}`
                          }
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <IconFileSearch className="w-4 h-4" />
                        </a>
                      )}
                      {/* {doc.isOrphan && ( */}
                      {session?.user?.access.activityAccess.deleteDocument && (
                        <button
                          onClick={() => handleDelete(doc.fileUrl)}
                          disabled={deletingFileUrl === doc.fileUrl}
                          className={`text-red-600 hover:underline flex items-center gap-1 ${
                            deletingFileUrl === doc.fileUrl ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {deletingFileUrl === doc.fileUrl ? (
                            <Trash2 className="w-4 h-4 animate-pulse" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${selectedFile ? 'bg-green-50' : ''}
              `}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-green-600">✓ {selectedFile.name}</p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <p>Drag and drop your PDF here, or</p>
                  <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`
                  px-4 py-2 rounded-md text-white
                  ${selectedFile && !isUploading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'}
                `}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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