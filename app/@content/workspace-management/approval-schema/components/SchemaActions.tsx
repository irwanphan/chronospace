'use client';
import { useState, useRef } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface SchemaActionsProps {
  schemaId: string;
}

export default function SchemaActions({ schemaId }: SchemaActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this schema?')) return;

    try {
      const response = await fetch(`/api/approval-schemas/${schemaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete schema');

      router.refresh();
    } catch (error) {
      console.error('Error deleting schema:', error);
      alert('Failed to delete schema');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Link
        href={`/workspace-management/approval-schema/${schemaId}`}
        className="p-2 hover:bg-gray-100 rounded-full inline-flex ml-1"
      >
        <Eye className="w-4 h-4" />
      </Link>

      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border z-10">
          <Link
            href={`/workspace-management/approval-schema/${schemaId}/edit`}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
            onClick={() => setShowDropdown(false)}
          >
            <Edit className="w-4 h-4" />
            Edit Schema
          </Link>
          <button
            onClick={() => {
              setShowDropdown(false);
              handleDelete();
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-red-600 w-full"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}      
    </div>
  );
} 