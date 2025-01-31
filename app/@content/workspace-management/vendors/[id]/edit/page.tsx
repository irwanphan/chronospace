'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function EditVendorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    documents: [] as File[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [divResponse, vendorResponse] = await Promise.all([
          fetch('/api/work-divisions'),
          fetch(`/api/vendors/${params.id}`)
        ]);

        if (!divResponse.ok || !vendorResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [vendorData] = await Promise.all([
          vendorResponse.json()
        ]);

        setFormData({
          code: vendorData.code,
          name: vendorData.name,
          email: vendorData.email,
          phone: vendorData.phone,
          address: vendorData.address || '',
          documents: [], // Existing documents will be shown separately
        });
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
    try {
      const response = await fetch(`/api/vendors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/workspace-management/vendors');
      }
    } catch (error) {
      console.error('Failed to update vendor:', error);
    }
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Vendor</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Vendor Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Store ITR"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vendor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="store.itr@example.com"
              required
            />
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
            onClick={() => router.back()}
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