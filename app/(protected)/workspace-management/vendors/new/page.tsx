'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Upload } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function NewVendorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    address: '',
    phone: '',
    email: '',
    documents: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    vendorCode?: string;
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Reset errors state

    try {
      const response = await fetch('/api/workspace-management/vendors', {
        method: 'POST',
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
      console.error('Error creating vendor:', error);
      setErrors({ general: 'Failed to create vendor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Vendor</h1>
      
      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6 border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5">
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
            <label className="block mb-1.5">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vendorName}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Store ITR"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Vendor Address
            </label>
            <RichTextEditor
              value={formData.address}
              onChange={(value: string) => setFormData(prev => ({ ...prev, address: value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="021 3243546576"
                required
              />
            </div>
            <div>
              <label className="block mb-1.5">
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
            <label className="block mb-1.5">Supporting Documents</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
              <span className="text-gray-500">No document uploaded</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/workspace-management/vendors"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
} 