'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus } from 'lucide-react';
import { Role } from '@/types/role';
import { stripHtmlTags } from '@/lib/utils';
import RoleActions from './components/RoleActions';
import Pagination from '@/components/Pagination';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
import { usePageTitleStore } from '@/store/usePageTitleStore';

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = roles.slice(startIndex, endIndex);
  const setPage = usePageTitleStore(state => state.setPage);
  
  useEffect(() => {
    setPage('Workspace Management', ['Role']);
  }, [setPage]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workspace-management/roles');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setError('Failed to load roles');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Role</h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/workspace-management/role/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      <Card className="mb-8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Approval Limit</th>
              <th className="text-left py-3 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Loading...</td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No roles found
                </td>
              </tr>
            ) : (
              currentRoles.map((role, index) => {
                // console.log(role);
                return (
                  <tr key={role.id} className="border-b hover:bg-blue-50">
                    <td className="py-3 px-4">{startIndex + index + 1}</td>
                    <td className="py-3 px-4">{role.roleName}</td>
                    <td className="py-3 px-4">
                      {stripHtmlTags(role.description) || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(role.approvalLimit)}
                    </td>
                    <td className="py-3 px-4">
                      <RoleActions 
                        roleId={role.id} 
                        onDelete={async () => {
                          const rolesRes = await fetch('/api/workspace-management/roles');
                          const rolesData = await rolesRes.json();
                          setRoles(rolesData);
                        }} 
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>
      <Pagination
        currentPage={currentPage}
        totalItems={roles.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 