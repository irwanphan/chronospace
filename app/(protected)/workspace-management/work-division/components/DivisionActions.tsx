'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useRouter } from 'next/navigation';

interface DivisionActionsProps {
  workDivisionId: string;
  onDelete: () => void;
}

export default function DivisionActions({ workDivisionId, onDelete }: DivisionActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this work division?')) return;

    try {
      const response = await fetch(`/api/workspace-management/work-division/${workDivisionId}`, {
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
      console.error('Error deleting work division:', error);
      alert('Failed to delete work division');
    }
  };

  return (
    <div className="relative flex items-center gap-2 transition-all duration-300" ref={dropdownRef}>
      <Link
        href={`/workspace-management/work-division/${workDivisionId}`}
        className="p-1 cursor-pointer w-6 h-6 hover:text-blue-500 rounded-full"
      >
        <Eye className="w-4 h-4" />
      </Link>
      
      <button 
        className="p-1 cursor-pointer w-6 h-6 hover:text-blue-500 rounded-full"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 min-w-[120px] z-10 border border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/workspace-management/work-division/${workDivisionId}/edit`);
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