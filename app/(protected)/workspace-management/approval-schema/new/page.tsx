'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkDivision } from '@/types/work-division';
import { Role } from '@/types/role';
import MultiSelect from '@/components/MultiSelect';
import AddStepModal from '@/components/AddStepModal';
import { User } from '@/types/user';
import { RichTextEditor } from '@/components/RichTextEditor';
import Card from '@/components/ui/Card';

interface ApprovalStepForm {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
}

export default function NewApprovalSchemaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
    approvalSteps: [] as ApprovalStepForm[],
  });

  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ data: ApprovalStepForm; index: number } | null>(null);

  useEffect(() => {
    FetchData();
  }, []);

  const FetchData = async () => {
    try {
      const response = await fetch('/api/workspace-management/approval-schemas/fetch-roles-users-divisions');
      if (response.ok) {
        const data = await response.json();
        setDivisions(data.workDivisions);
        setRoles(data.roles);
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to fetch data. Please try again later.');
    }
  };

  const addStep = (stepData: ApprovalStepForm) => {
    setFormData(prev => ({
      ...prev,
      approvalSteps: [...prev.approvalSteps, stepData].sort((a, b) => {
        // Sort by budget limit, undefined limits go last
        if (a.budgetLimit === undefined) return 1;
        if (b.budgetLimit === undefined) return -1;
        return a.budgetLimit - b.budgetLimit;
      }),
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      approvalSteps: prev.approvalSteps.filter((_, i) => i !== index),
    }));
  };

  const handleEditStep = (index: number) => {
    const approvalStep = formData.approvalSteps[index];
    setEditingStep({
      data: {
        roleId: approvalStep.roleId,
        specificUserId: approvalStep.specificUserId,
        budgetLimit: approvalStep.budgetLimit,
        duration: approvalStep.duration,
        overtimeAction: approvalStep.overtimeAction,
      },
      index
    });
    setIsAddStepModalOpen(true);
  };

  const handleStepSubmit = (stepData: ApprovalStepForm) => {
    if (editingStep !== null) {
      // Edit existing step
      setFormData(prev => ({
        ...prev,
        approvalSteps: prev.approvalSteps.map((step, i) => 
          i === editingStep.index ? stepData : step
        ).sort((a, b) => {
          // Sort by budget limit, undefined limits go last
          if (a.budgetLimit === undefined) return 1;
          if (b.budgetLimit === undefined) return -1;
          return a.budgetLimit - b.budgetLimit;
        })
      }));
      setEditingStep(null);
    } else {
      // Add new step
      addStep(stepData);
    }
    setIsAddStepModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestBody = {
        name: formData.name,
        documentType: formData.documentType,
        description: formData.description || '',
        workDivisions: JSON.stringify(formData.workDivisions),
        roles: JSON.stringify(formData.roles),
        approvalSteps: formData.approvalSteps.map((step, index) => ({
          role: step.roleId,
          specificUserId: step.specificUserId || null,
          duration: step.duration,
          overtimeAction: step.overtimeAction === 'Notify and Wait' ? 'Notify and Wait' : 'Auto Decline',
          limit: step.budgetLimit || null,
          order: index + 1
        }))
      };

      console.log('Submitting data:', requestBody);

      const response = await fetch('/api/workspace-management/approval-schemas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create approval schema');
      }

      router.push('/workspace-management/approval-schema');
      router.refresh();
    } catch (error) {
      console.error('Error creating approval schema:', error);
      setError(error instanceof Error ? error.message : 'Failed to create approval schema');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Approval Schema</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
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

            <div className="bg-white rounded-lg mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Approval Steps</h2>
                <button
                  type="button"
                  onClick={() => setIsAddStepModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
                            {roles.find(r => r.id === step.roleId)?.roleName}
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
        editData={editingStep?.data}
        isEdit={editingStep !== null}
      />
    </div>
  );
} 