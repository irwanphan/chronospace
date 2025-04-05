'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { MoreVertical, Edit, Trash, Eye, Key, Lock } from 'lucide-react';

interface UserActionsProps {
  userId: string;
  canEditUser: boolean;
  canManageUserAccess: boolean;
  canDeleteUser: boolean;
  canCreateUser: boolean;
  canChangePassword: boolean;
  canChangeOtherUserPassword: boolean;
  onDelete: () => void;
}

export default function UserActions({ 
  userId, 
  canEditUser,
  canManageUserAccess,
  canDeleteUser,
  canCreateUser,
  canChangePassword,
  canChangeOtherUserPassword,
  onDelete 
}: UserActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/user-management/${userId}`, {
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
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <Link
        href={`/user-management/${userId}`}
        className="p-1 cursor-pointer w-6 h-6 hover:bg-gray-100 rounded-full"
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
        <div className="absolute right-0 top-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg py-2 w-48 z-50">
          {canEditUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user-management/${userId}/edit`);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {canManageUserAccess && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user-management/${userId}/access-control`);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Access Control
            </button>
          )}
          {canChangePassword && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user-management/${userId}/change-password`);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          )}
          {canChangeOtherUserPassword && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user-management/${userId}/change-other-user-password`);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Other User Password
            </button>
          )}
          {canDeleteUser && (
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
          {!canCreateUser && !canEditUser && !canDeleteUser && !canManageUserAccess && (
            <div className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              No Access
            </div>
          )}
        </div>
      )}
    </div>
  );
} 