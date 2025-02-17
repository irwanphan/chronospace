'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function EditVendorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    email: '',
    phone: '',
    address: '',
    documents: [] as File[],
  });
  const [errors, setErrors] = useState<{
    email?: string;
    vendorCode?: string;
    general?: string;
  }>({});
  // const [existingDocuments, setExistingDocuments] = useState<Array<{
  //   id: string;
  //   name: string;
  //   url: string;
  // }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/workspace-management/vendors/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const vendorData = await response.json();
        setFormData({
          vendorCode: vendorData.vendorCode,
          vendorName: vendorData.vendorName,
          email: vendorData.email,
          phone: vendorData.phone,
          address: vendorData.address || '',
          documents: [], // For new uploads
        });
        
        // setExistingDocuments(vendorData.documents || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load vendor data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleUpload = (files: FileList) => {
    setFormData(prev => ({
      ...prev,
      documents: [...Array.from(files)]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});  // Reset errors
    
    try {
      const response = await fetch(`/api/workspace-management/vendors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes('Email')) {
          setErrors(prev => ({ ...prev, email: data.error }));
        } else if (data.error.includes('Vendor code')) {
          setErrors(prev => ({ ...prev, vendorCode: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error }));
        }
        return;
      }

      router.push('/workspace-management/vendors');
    } catch (error) {
      console.error('Error updating vendor:', error);
      setErrors({ general: 'Failed to update vendor' });
    }
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Vendor</h1>
      
      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 border border-gray-200 rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Vendor Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.vendorCode}
            onChange={(e) => setFormData(prev => ({ ...prev, vendorCode: e.target.value }))}
            className={`w-full px-4 py-2 border rounded-lg ${errors.vendorCode ? 'border-red-500' : ''}`}
            placeholder="Store ITR"
            required
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
            value={formData.vendorName}
            onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Store ITR"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vendor Address
          </label>
          <RichTextEditor
            value={formData.address}
            onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="021 3243546576"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
              placeholder="store.itr@example.com"
              required
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
            <button
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Document
            </button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <span className="ml-3 text-gray-500">
              {formData.documents.length > 0 
                ? `${formData.documents.length} files selected` 
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
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
} 