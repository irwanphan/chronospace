'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useRouter } from 'next/navigation';

interface BudgetActionsProps {
  budgetId: string;
  canEditBudget: boolean;
  canDeleteBudget: boolean;
  onDelete: () => void;
}

export default function BudgetActions({ 
  budgetId, 
  canEditBudget,
  canDeleteBudget,
  onDelete 
}: BudgetActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await fetch(`/api/budget-planning/${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete budget');

      onDelete();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <Link 
        href={`/budget-planning/${budgetId}`} 
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <Eye className="w-4 h-4 text-gray-500" />
      </Link>
      
      <button 
        className="p-2 hover:bg-gray-100 rounded-full"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-2 w-36 z-50 border border-gray-200">
          {canEditBudget && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/budget-planning/${budgetId}/edit`);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDeleteBudget && (
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
          )}
        </div>
      )}
    </div>
  );
} 