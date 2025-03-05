'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useRouter } from 'next/navigation';

interface VendorActionsProps {
  vendorId: string;
  onDelete: () => void;
}

export default function VendorActions({ vendorId, onDelete }: VendorActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`/api/workspace-management/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error);
        return;
      }

      onDelete();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <Link
        href={`/workspace-management/vendors/${vendorId}`}
        className="p-1 cursor-pointer w-6 h-6 hover:bg-gray-100 rounded-full"
      >
        <Eye className="w-4 h-4 text-gray-500" />
      </Link>
      
      <button 
        className="p-1 cursor-pointer w-6 h-6 hover:bg-gray-100 rounded-full"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 min-w-[120px] z-10 border border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/workspace-management/vendors/${vendorId}/edit`);
              setShowDropdown(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
} 