'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { X, Plus, Trash, Pencil } from 'lucide-react';
import { WorkDivision } from '@/types/work-division';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import MultiSelect from '@/components/MultiSelect';
import AddStepModal from '@/components/AddStepModal';
import { RichTextEditor } from '@/components/RichTextEditor';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

interface ApprovalStep {
  id: string;
  role: Role;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
}

interface StepFormData {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
}

export default function EditApprovalSchemaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    documentType: '',
    description: '',
    workDivisions: [] as string[],
    roles: [] as string[],
    approvalSteps: [] as ApprovalStep[],
  });

  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ data: ApprovalStep; index: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/workspace-management/approval-schemas/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch schema');
        }
        const data = await response.json();
        const { schema, divisions, roles, users } = data;
        setDivisions(Array.isArray(divisions) ? divisions : []);
        setRoles(Array.isArray(roles) ? roles : []);
        setUsers(Array.isArray(users) ? users : []);
        setFormData({
          name: schema.name || '',
          documentType: schema.documentType || '',
          description: schema.description || '',
          workDivisions: schema.workDivisionIds ? JSON.parse(schema.workDivisionIds) : [],
          roles: schema.roleIds ? JSON.parse(schema.roleIds) : [],
          approvalSteps: schema.approvalSteps || []
        });

        if (response.ok) {
          const formattedData = {
            name: schema.name || '',
            documentType: schema.documentType || '',
            description: schema.description || '',
            workDivisions: schema.workDivisionIds ? JSON.parse(schema.workDivisionIds) : [],
            roles: schema.roleIds ? JSON.parse(schema.roleIds) : [],
            approvalSteps: Array.isArray(schema.approvalSteps)
              ? schema.approvalSteps.map((step: ApprovalStep) => ({
                  ...step,
                  role: step.role || '',
                }))
              : []
          };
          console.log('Formatted Data:', formattedData);
          setFormData(formattedData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Monitoring perubahan formData
  // useEffect(() => {
  //   console.log('Current formData:', formData);
  // }, [formData]);

  if (isLoading) return <LoadingSpin />

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      approvalSteps: prev.approvalSteps.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestBody = {
        name: formData.name,
        documentType: formData.documentType,
        description: formData.description || '',
        workDivisionIds: JSON.stringify(formData.workDivisions),
        roleIds: JSON.stringify(formData.roles),
        approvalSteps: formData.approvalSteps.map((step, index) => ({
          roleId: step.role.id,
          specificUserId: step.specificUserId || null,
          duration: step.duration,
          overtimeAction: step.overtimeAction === 'Notify and Wait' ? 'Notify and Wait' : 'Auto Decline',
          budgetLimit: step.budgetLimit || null,
          stepOrder: index + 1
        }))
      };

      const response = await fetch(`/api/workspace-management/approval-schemas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to update approval schema');
      }
      router.push('/workspace-management/approval-schema');
      router.refresh();
    } catch (error) {
      console.error('Error updating approval schema:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStep = (stepData: ApprovalStep) => {
    setFormData(prev => ({
      ...prev,
      approvalSteps: [...prev.approvalSteps, stepData]
    }));
  };

  const handleEditStep = (index: number) => {
    const step = formData.approvalSteps[index];
    setEditingStep({
      data: {
        id: step.id,
        role: step.role,
        specificUserId: step.specificUserId,
        budgetLimit: step.budgetLimit,
        duration: step.duration,
        overtimeAction: step.overtimeAction,
      },
      index
    });
    setIsAddStepModalOpen(true);
  };

  const handleStepSubmit = (stepData: StepFormData) => {
    const approvalStep: ApprovalStep = {
      id: editingStep?.data.id || crypto.randomUUID(),
      role: roles.find(r => r.id === stepData.roleId)!,
      specificUserId: stepData.specificUserId,
      budgetLimit: stepData.budgetLimit,
      duration: stepData.duration,
      overtimeAction: stepData.overtimeAction
    };

    if (editingStep !== null) {
      setFormData(prev => ({
        ...prev,
        approvalSteps: prev.approvalSteps.map((step, i) => 
          i === editingStep.index ? approvalStep : step
        )
      }));
      setEditingStep(null);
    } else {
      handleAddStep(approvalStep);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Approval Schema</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5">
                Schema Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                required
              >
                <option value="">Select Document Type</option>
                <option value="Purchase Request">Purchase Request</option>
                <option value="Memo">Memo</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5">
                Apply to Work Division <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                options={divisions.map(div => ({ id: div.id!, name: div.name }))}
                value={formData.workDivisions}
                onChange={(value) => setFormData(prev => ({ ...prev, workDivisions: value }))}
                placeholder="Select work divisions..."
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Apply to Roles <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                options={roles.map(role => ({ id: role.id!, name: role.roleName }))}
                value={formData.roles}
                onChange={(value) => setFormData(prev => ({ ...prev, roles: value }))}
                placeholder="Select roles..."
              />
            </div>

            <div>
              <label className="block mb-1.5">Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
              />
            </div>

            <div className="bg-white rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Approval Steps</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingStep(null);  // Reset editing state
                    setIsAddStepModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Specific User</th>
                      {formData.documentType === 'Purchase Request' && (
                        <th className="text-left py-3 px-4">Limit</th>
                      )}
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Overtime</th>
                      <th className="text-left py-3 px-4 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.approvalSteps.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          No steps added yet
                        </td>
                      </tr>
                    ) : (
                      formData.approvalSteps.map((step, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">
                            {step.role.roleName}
                          </td>
                          <td className="py-3 px-4">
                            {step.specificUserId 
                              ? users.find(u => u.id === step.specificUserId)?.name 
                              : 'Any user with role'}
                          </td>
                          {formData.documentType === 'Purchase Request' && (
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
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditStep(index)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeStep(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
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
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </Card>
      <AddStepModal
        isOpen={isAddStepModalOpen}
        onClose={() => {
          setIsAddStepModalOpen(false);
          setEditingStep(null);
        }}
        onSubmit={handleStepSubmit}
        roles={roles}
        users={users}
        documentType={formData.documentType}
        editData={editingStep?.data ? {
          roleId: editingStep.data.role.id,
          specificUserId: editingStep.data.specificUserId,
          budgetLimit: editingStep.data.budgetLimit,
          duration: editingStep.data.duration,
          overtimeAction: editingStep.data.overtimeAction
        } : undefined}
        isEdit={editingStep !== null}
      />
    </div>
  );
} 