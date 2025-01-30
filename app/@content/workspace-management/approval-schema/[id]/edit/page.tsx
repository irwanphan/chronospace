'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkDivision } from '@/types/workDivision';
import { Role } from '@/types/role';
import MultiSelect from '@/components/MultiSelect';
import AddStepModal from '@/components/AddStepModal';
import { User } from '@/types/user';
import { RichTextEditor } from '@/components/RichTextEditor';

interface ApprovalStepForm {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'NOTIFY' | 'AUTO_REJECT';
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

  const [stepFormData, setStepFormData] = useState<ApprovalStepForm>({
    roleId: '',
    specificUserId: undefined,
    budgetLimit: undefined,
    duration: 48,
    overtimeAction: 'NOTIFY',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisionsRes, rolesRes, usersRes, schemaRes] = await Promise.all([
          fetch('/api/work-divisions'),
          fetch('/api/roles'),
          fetch('/api/users'),
          fetch(`/api/approval-schemas/${params.id}`)
        ]);

        if (divisionsRes.ok) {
          const data = await divisionsRes.json();
          console.log('Divisions:', data);
          setDivisions(Array.isArray(data) ? data : []);
        }

        if (rolesRes.ok) {
          const data = await rolesRes.json();
          console.log('Roles:', data);
          setRoles(Array.isArray(data) ? data : []);
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          console.log('Users:', data);
          setUsers(Array.isArray(data) ? data : []);
        }

        if (schemaRes.ok) {
          const schema = await schemaRes.json();
          console.log('Schema Data:', schema);
          
          // Pastikan data yang diterima sesuai dengan yang diharapkan
          const formattedData = {
            name: schema.name || '',
            documentType: schema.documentType || '',
            description: schema.description || '',
            workDivisions: Array.isArray(schema.workDivisions) 
              ? schema.workDivisions 
              : typeof schema.workDivisions === 'string'
                ? JSON.parse(schema.workDivisions)
                : [],
            roles: Array.isArray(schema.roles)
              ? schema.roles
              : typeof schema.roles === 'string'
                ? JSON.parse(schema.roles)
                : [],
            steps: Array.isArray(schema.steps)
              ? schema.steps.map((step: any) => ({
                  roleId: step.roleId || step.role_id || '',
                  specificUserId: step.specificUserId || step.specific_user_id,
                  budgetLimit: step.budgetLimit || step.budget_limit,
                  duration: step.duration || 48,
                  overtimeAction: step.overtimeAction || step.overtime_action || 'NOTIFY'
                }))
              : []
          };

          console.log('Formatted Data:', formattedData);
          setFormData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.id]);

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        roleId: '',
        duration: 1,
        overtimeAction: 'NOTIFY',
      }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, field: keyof ApprovalStepForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => {
        if (i === index) {
          return { ...step, [field]: value };
        }
        return step;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/approval-schemas/${params.id}`, {
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

  const handleAddStep = (step: ApprovalStepForm) => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, step]
    }));
    setIsAddStepModalOpen(false);
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
                        <td className="py-3 px-4">{step.duration / 24} days</td>
                        <td className="py-3 px-4">
                          {step.overtimeAction === 'NOTIFY' ? 'Notify and Wait' : 'Auto Reject'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <AddStepModal
              isOpen={isAddStepModalOpen}
              onClose={() => setIsAddStepModalOpen(false)}
              onSubmit={handleAddStep}
              roles={roles}
              users={users}
              documentType={formData.documentType}
              formData={stepFormData}
              setFormData={setStepFormData}
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