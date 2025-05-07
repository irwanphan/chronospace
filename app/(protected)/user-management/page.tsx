'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";

import { Plus, Filter, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { User } from '@/types/user';
import UserActions from './components/UserActions';
import Pagination from '@/components/Pagination';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/types/role';
import { WorkDivision } from '@/types/work-division';

export default function UserManagementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const canCreateUser = session?.user?.access?.activityAccess?.createUser;
  const canEditUser = session?.user?.access?.activityAccess?.editUser;
  const canDeleteUser = session?.user?.access?.activityAccess?.deleteUser;
  const canManageUserAccess = session?.user?.access?.activityAccess?.manageUserAccess;
  const canChangePassword = session?.user?.access?.activityAccess?.changePassword;
  const canChangeOtherUserPassword = session?.user?.access?.activityAccess?.changeOtherUserPassword;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const [selectedWorkDivision, setSelectedWorkDivision] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [workDivisions, setWorkDivisions] = useState<WorkDivision[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // console.log('can change password', canChangePassword);
  // console.log('can change other user password', canChangeOtherUserPassword);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user-management');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
        setWorkDivisions(data.workDivisions || []);
        setRoles(data.roles || []);
        // Initialize with all divisions and roles selected
        setSelectedWorkDivision(data.workDivisions.map((div: WorkDivision) => div.id || ''));
        setSelectedRole(data.roles.map((role: Role) => role.id || ''));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users) return;

    let filtered = [...users];

    // If no divisions or roles selected, show no users
    if (selectedWorkDivision.length === 0 || selectedRole.length === 0) {
      filtered = [];
    } else {
      // Filter by division
      if (selectedWorkDivision.length > 0) {
        filtered = filtered.filter(user => selectedWorkDivision.includes(user.workDivisionId || ''));
    }

      // Filter by role
      if (selectedRole.length > 0) {
        filtered = filtered.filter(user => selectedRole.includes(user.roleId || ''));
    }

      // Filter by search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      );
      }
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, selectedWorkDivision, selectedRole, searchKeyword]);

  const handleWorkDivisionToggle = (divisionId: string) => {
    setSelectedWorkDivision(prev => 
      prev.includes(divisionId)
        ? prev.filter(id => id !== divisionId)
        : [...prev, divisionId]
    );
  };

  const handleSelectAllWorkDivisions = () => {
    setSelectedWorkDivision(workDivisions.map(div => div.id || ''));
  };

  const handleDeselectAllWorkDivisions = () => {
    setSelectedWorkDivision([]);
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRole(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAllRoles = () => {
    setSelectedRole(roles.map(role => role.id || ''));
  };

  const handleDeselectAllRoles = () => {
    setSelectedRole([]);
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="wax-w-full">
      <h1 className="text-2xl font-semibold mb-6">User List</h1>

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
                {(selectedWorkDivision.length < workDivisions.length || selectedRole.length < roles.length) && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {selectedWorkDivision.length}/{workDivisions.length} Div, {selectedRole.length}/{roles.length} Role
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white">
              <div className="space-y-6">
                {/* Work Division Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Filter by Work Division</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAllWorkDivisions}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAllWorkDivisions}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {workDivisions.map((division) => (
                      <div key={division.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={division.id}
                          checked={selectedWorkDivision.includes(division.id || '')}
                          onCheckedChange={() => handleWorkDivisionToggle(division.id || '')}
                        />
                        <label
                          htmlFor={division.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {division.name} ({division.code})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Filter by Role</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAllRoles}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAllRoles}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.id}
                          checked={selectedRole.includes(role.id || '')}
                          onCheckedChange={() => handleRoleToggle(role.id || '')}
                        />
                        <label
                          htmlFor={role.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {role.roleName}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-3">
          {canCreateUser && (
            <Link
              href="/user-management/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add New User
            </Link>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">#</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">User Name</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">Last Active</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">Date Added</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">Loading...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  {searchKeyword.trim() 
                    ? `No users found matching "${searchKeyword}"`
                    : selectedWorkDivision.length === 0 || selectedRole.length === 0
                    ? "Please select at least one division and role"
                    : "No users found"}
                </td>
              </tr>
            ) : (
              currentUsers.map((user:User, index:number) => (
                <tr key={user.id} className="hover:bg-blue-50">
                  <td className="px-3 py-2 text-sm">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm">{user.role.roleName}</td>
                  <td className="px-3 py-2 text-sm">{formatDate(user.lastLogin)}</td>
                  <td className="px-3 py-2 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-3 py-2 text-right">
                    <UserActions 
                      userId={user.id.toString()}
                      sessionUserId={session?.user?.id ?? ''}
                      canEditUser={canEditUser ?? false}
                      canManageUserAccess={canManageUserAccess ?? false}
                      canDeleteUser={canDeleteUser ?? false}
                      canCreateUser={canCreateUser ?? false}
                      canChangePassword={canChangePassword ?? false}
                      canChangeOtherUserPassword={canChangeOtherUserPassword ?? false}
                      onDelete={async () => {
                        const usersRes = await fetch('/api/user-management');
                        const usersData = await usersRes.json();
                        setUsers(usersData.users);
                      }} 
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 