'use client';
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewVendorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create vendor');
      }

      router.push('/workspace-management/vendors');
      router.refresh();
    } catch (error) {
      console.error('Error creating vendor:', error);
      // Handle error (show error message to user)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Vendor</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5">
              Vendor Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vendorCode}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorCode: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Store ITR"
              required
            />
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
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b px-3 py-2 flex gap-2">
                <select className="bg-transparent text-sm px-2 py-1 rounded border">
                  <option>Normal</option>
                  <option>Sailec Light</option>
                </select>
                <div className="flex items-center gap-1 border-l pl-2">
                  <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                    <strong className="text-sm">B</strong>
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-100 rounded italic">
                    <strong className="text-sm">I</strong>
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-100 rounded underline">
                    <strong className="text-sm">U</strong>
                  </button>
                </div>
              </div>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter address..."
              />
            </div>
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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="store.itr@example.com"
                required
              />
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