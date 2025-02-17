'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { X, Plus, Trash, Pencil } from 'lucide-react';
import { WorkDivision } from '@/types/workDivision';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import MultiSelect from '@/components/MultiSelect';
import AddStepModal from '@/components/AddStepModal';
import { RichTextEditor } from '@/components/RichTextEditor';

interface ApprovalStepForm {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
}

interface ApiStep {
  role: string;
  specificUserId?: string;
  limit?: number;
  duration: number;
  overtime: 'Notify and Wait' | 'Auto Decline';
}

export default function EditApprovalSchemaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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
    steps: [] as ApprovalStepForm[],
  });

  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ data: ApprovalStepForm; index: number } | null>(null);

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
        setFormData({
          name: schema.name || '',
          documentType: schema.documentType || '',
          description: schema.description || '',
          workDivisions: schema.workDivisions || [],
          roles: schema.roles || [],
          steps: schema.steps || []
        });

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

          // console.log('Parsed Roles:', parsedRoles);
          // console.log('Parsed Divisions:', parsedDivisions);

          const formattedData = {
            name: schema.name || '',
            documentType: schema.documentType || '',
            description: schema.description || '',
            workDivisions: parsedDivisions,
            roles: parsedRoles,
            steps: Array.isArray(schema.steps)
              ? schema.steps.map((step: ApiStep) => ({
                  roleId: step.role || '',
                  specificUserId: step.specificUserId,
                  budgetLimit: step.limit,
                  duration: step.duration,
                  overtimeAction: step.overtime
                }))
              : []
          };
          // console.log('Formatted Data:', formattedData);
          setFormData(formattedData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [params.id]);

  // Monitoring perubahan formData
  // useEffect(() => {
  //   console.log('Current formData:', formData);
  // }, [formData]);

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/workspace-management/approval-schemas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          workDivisions: JSON.stringify(formData.workDivisions),
          roles: JSON.stringify(formData.roles),
        }),
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

  const handleAddStep = (stepData: ApprovalStepForm) => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, stepData]
    }));
  };

  const handleEditStep = (index: number) => {
    const step = formData.steps[index];
    setEditingStep({
      data: {
        roleId: step.roleId,
        specificUserId: step.specificUserId,
        budgetLimit: step.budgetLimit,
        duration: step.duration,
        overtimeAction: step.overtimeAction,
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
        steps: prev.steps.map((step, i) => 
          i === editingStep.index ? stepData : step
        )
      }));
      setEditingStep(null);
    } else {
      // Add new step
      handleAddStep(stepData);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Approval Schema</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
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
              options={divisions.map(div => ({ id: div.id!, name: div.divisionName }))}
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

          <div className="bg-white rounded-lg p-6 mt-6">
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
                  {formData.steps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No steps added yet
                      </td>
                    </tr>
                  ) : (
                    formData.steps.map((step, index) => (
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
    </div>
  );
} 