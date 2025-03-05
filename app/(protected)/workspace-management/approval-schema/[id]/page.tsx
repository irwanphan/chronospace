'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { X } from 'lucide-react';
import { WorkDivision } from '@/types/workDivision';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import MultiSelect from '@/components/MultiSelect';
import LoadingSpin from '@/components/ui/LoadingSpin';
interface ApiStep {
  role: string;
  specificUserId?: string;
  limit?: number;
  duration: number;
  overtime: 'Notify and Wait' | 'Auto Decline';
}

interface FormattedSchema {
  name: string;
  documentType: string;
  description: string;
  workDivisions: string[];
  roles: string[];
  approvalSteps: Array<{
    roleId: string;
    specificUserId?: string;
    budgetLimit?: number;
    duration: number;
    overtimeAction: 'Notify and Wait' | 'Auto Decline';
  }>;
}

export default function ViewApprovalSchemaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [schema, setSchema] = useState<FormattedSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log('Fetching schema with ID:', params.id);
        const response = await fetch(`/api/workspace-management/approval-schemas/${params.id}`);
        // console.log('Response:', response);
        if (!response.ok) {
          throw new Error('Failed to fetch schema');
        }
        const data = await response.json();
        const { schema, divisions, roles, users } = data;
        setDivisions(Array.isArray(divisions) ? divisions : []);
        setRoles(Array.isArray(roles) ? roles : []);
        setUsers(Array.isArray(users) ? users : []);
        setSchema(schema);

        if (response.ok) {
          // Parse divisions dan roles dari string menjadi array
          const parsedDivisions = schema.divisions 
            ? schema.divisions.startsWith('[') 
              ? JSON.parse(schema.divisions)
              : schema.divisions.split(',')
            : [];

          const parsedRoles = schema.roles
            ? schema.roles.startsWith('[') 
              ? JSON.parse(schema.roles)
              : schema.roles.split(',')
            : [];

          const formattedData = {
            name: schema.name || '',
            documentType: schema.documentType || '',
            description: schema.description || '',
            workDivisions: parsedDivisions,
            roles: parsedRoles,
            approvalSteps: Array.isArray(schema.approvalSteps)
              ? schema.approvalSteps.map((step: ApiStep) => ({
                  roleId: step.role || '',
                  specificUserId: step.specificUserId,
                  budgetLimit: step.limit,
                  duration: step.duration,
                  overtimeAction: step.overtime
                }))
              : []
          };
          // console.log('Formatted Data:', formattedData);
          setSchema(formattedData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) return <LoadingSpin />
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">View Approval Schema</h1>
      
      <form className="bg-white rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5">
              Schema Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={schema?.name || ''}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Document Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={schema?.documentType || ''}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Apply to Work Division <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={divisions.map(div => ({ id: div.id!, name: div.divisionName }))}
              value={schema?.workDivisions || []}
              onChange={() => {}}
              readonly
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Apply to Roles <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={roles.map(role => ({ id: role.id!, name: role.roleName }))}
              value={schema?.roles || []}
              onChange={() => {}}
              readonly
            />
          </div>

          <div>
            <label className="block mb-1.5">Description</label>
            <div 
              className="w-full px-4 py-2 border rounded-lg"
              dangerouslySetInnerHTML={{ __html: schema?.description || '' }}
            />
          </div>

          <div className="bg-white rounded-lg mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Approval Steps</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Specific User</th>
                    {schema?.documentType === 'Purchase Request' && (
                      <th className="text-left py-3 px-4">Limit</th>
                    )}
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Overtime</th>
                    <th className="text-left py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {schema?.approvalSteps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No steps added yet
                      </td>
                    </tr>
                  ) : (
                    schema?.approvalSteps.map((step, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">
                          {roles.find(r => r.id === step.roleId)?.roleName}
                        </td>
                        <td className="py-3 px-4">
                          {step.specificUserId 
                            ? users.find(u => u.id === step.specificUserId)?.name 
                            : 'Any user with role'}
                        </td>
                        {schema?.documentType === 'Purchase Request' && (
                          <td className="py-3 px-4">
                            {step.budgetLimit ? new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(step.budgetLimit) : '-'}
                          </td>
                        )}
                        <td className="py-3 px-4">{step.duration} days</td>
                        <td className="py-3 px-4">
                          {step.overtimeAction === 'Notify and Wait' ? 'Notify and Wait' : 'Auto Decline'}
                        </td>
                        <td className="py-3 px-4"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/workspace-management/approval-schema"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Back
          </Link>
          <button
            type="submit"
            onClick={() => router.push(`/workspace-management/approval-schema/${params.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            Edit
          </button>
        </div>
      </form>
    </div>
  );
} 