'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { ApprovalSchema } from '@/types/approvalSchema';
import { WorkDivision } from '@/types/workDivision';
import { Role } from '@/types/role';

export default function ApprovalSchemaPage() {
  const [schemas, setSchemas] = useState<ApprovalSchema[]>([]);
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchSchemas(),
      fetchDivisions(),
      fetchRoles(),
    ]);
  }, []);

  const fetchSchemas = async () => {
    try {
      const response = await fetch('/api/approval-schemas');
      if (!response.ok) throw new Error('Failed to fetch schemas');
      const data = await response.json();
      setSchemas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
      setError('Failed to load approval schemas');
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/work-divisions');
      if (!response.ok) throw new Error('Failed to fetch divisions');
      const data = await response.json();
      setDivisions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDivisionNames = (divisionIds: string[]) => {
    return divisions
      .filter(div => divisionIds.includes(div.id!))
      .map(div => div.divisionName)
      .join(', ');
  };

  const getRoleNames = (roleIds: string[]) => {
    return roles
      .filter(role => roleIds.includes(role.id!))
      .map(role => role.roleName)
      .join(', ');
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <Link
            href="/workspace-management/approval-schema/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Schema
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : schemas.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No approval schemas found
          </div>
        ) : (
          schemas.map((schema) => (
            <div key={schema.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{schema.name}</h3>
                  <span className="text-sm text-gray-500">{schema.documentType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/workspace-management/approval-schema/${schema.id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </Link>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Applicable Work Divisions:</span>
                  <p className="text-gray-600">
                    {getDivisionNames(JSON.parse(schema.workDivisions as string))}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Applicable Roles:</span>
                  <p className="text-gray-600">
                    {getRoleNames(JSON.parse(schema.roles as string))}
                  </p>
                </div>
                {schema.description && (
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-gray-600">{schema.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Approval Steps</h4>
                <div className="space-y-2">
                  {schema.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">Step {index + 1}:</span>
                      <span>{roles.find(r => r.id === step.roleId)?.roleName}</span>
                      {step.budgetLimit && (
                        <span>
                          (Up to{' '}
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(step.budgetLimit)}
                          )
                        </span>
                      )}
                      <span>{step.duration}h</span>
                      <span>{step.overtimeAction === 'NOTIFY' ? 'Notify Only' : 'Auto Reject'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 