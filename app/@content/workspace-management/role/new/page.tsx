'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function NewRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roleCode: '',
    roleName: '',
    description: '',
    upperLevel: '',
    approvalLimit: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          approvalLimit: Number(formData.approvalLimit),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      router.push('/workspace-management/role');
      router.refresh();
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Role</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5">
              Role Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roleCode}
              onChange={(e) => setFormData(prev => ({ ...prev, roleCode: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Dept. Head"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roleName}
              onChange={(e) => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Dept. Head"
              required
            />
          </div>

          <div className="mb-20">
            <label className="block mb-1.5">
              Role Description
            </label>
            <div className="border rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                className="
                  [&_.ql-toolbar.ql-snow]:border-0
                  [&_.ql-toolbar.ql-snow]:bg-blue-50 
                  [&_.ql-toolbar.ql-snow]:border-b
                  [&_.ql-toolbar.ql-snow]:border-gray-200
                  [&_.ql-container.ql-snow]:border-0
                  [&_.ql-editor]:text-base
                  [&_.ql-editor]:leading-relaxed
                  [&_.ql-editor]:text-gray-500
                  [&_.ql-editor]:h-20
                "
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                  ]
                }}
                placeholder="Enter description..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5">
                Upper Level (Parent)
              </label>
              <select
                value={formData.upperLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, upperLevel: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-</option>
                {/* Add options dynamically from parent roles */}
              </select>
            </div>
            <div>
              <label className="block mb-1.5">
                Approval Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.approvalLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, approvalLimit: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="50000000"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/workspace-management/role"
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