'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Search, Filter, Plus } from 'lucide-react';
import { ApprovalSchema, ApprovalStep } from '@/types/approval-schema';
import { WorkDivision } from '@/types/work-division';
import { Role } from '@/types/role';
import { stripHtmlTags, formatCurrency } from '@/lib/utils';
import SchemaActions from './components/SchemaActions';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Pagination from '@/components/Pagination';
import Card from '@/components/ui/Card';

export default function ApprovalSchemaPage() {
  const [schemas, setSchemas] = useState<ApprovalSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchemas = schemas.slice(startIndex, endIndex);

  // console.log('schemas : ', schemas)

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const response = await fetch('/api/workspace-management/approval-schemas');
        if (!response.ok) throw new Error('Failed to fetch schemas');
        const data = await response.json();
        setSchemas(data.approvalSchemas || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch schemas:', error);
        setError('Failed to load approval schemas');
      }
    };
    fetchSchemas();
  }, []);

  const getDivisionNames = (applicableWorkDivisions: WorkDivision[]) => {
    if (!applicableWorkDivisions) return '';
    const workDivisionList = applicableWorkDivisions.map(division => division.id);
    const workDivisionNames = applicableWorkDivisions
      .filter(division => workDivisionList.includes(division.id || ''))
      .map(division => division.name)
      .join(', ');
    return workDivisionNames;
  };

  const getRoleNames = (applicableRoles: Role[]) => {
    if (!applicableRoles) return '';
    const roleList = applicableRoles.map(role => role.id);
    const roleNames = applicableRoles
      .filter(role => roleList.includes(role.id))
      .map(role => role.roleName)
      .join(', ');
    return roleNames;
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const refreshData = await fetch('/api/workspace-management/approval-schemas');
      const data = await refreshData.json();
      setSchemas(data.schemas);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Approval Schema</h1>

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
          currentSchemas.map((schema: ApprovalSchema) => (
            <Card key={schema.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{schema.name}</h3>
                  <span className="text-sm text-gray-500">{schema.documentType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SchemaActions 
                    schemaId={schema.id || ''}
                    onDelete={refreshData}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Applicable Work Divisions:</span>
                  <p className="text-gray-600">
                    {getDivisionNames(schema.applicableWorkDivisions)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Applicable Roles:</span>
                  <p className="text-gray-600">
                    {getRoleNames(schema.applicableRoles)}
                  </p>
                </div>
                {schema.description && (
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-gray-600">{stripHtmlTags(schema.description)}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Approval Steps</h4>
                <div className="space-y-2">
                  {schema.approvalSteps.map((step: ApprovalStep, index: number) => (
                    <div key={step.id} className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">Step {index + 1}:</span>
                      <span>
                        {step.role.roleName}
                      </span>
                      {step.budgetLimit && (
                        <span className="text-gray-500">
                          {formatCurrency(step.budgetLimit)}
                        </span>
                      )}
                      <span>{step.duration}d</span>
                      <span>{step.overtimeAction === 'Notify and Wait' ? 'Notify and Wait' : 'Auto Decline'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={schemas.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 