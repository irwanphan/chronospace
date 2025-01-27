'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkDivision } from '@/types/workDivision';
import { Role } from '@/types/role';

interface ApprovalStepForm {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'NOTIFY' | 'AUTO_REJECT';
}

export default function NewApprovalSchemaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    documentType: '',
    description: '',
    workDivisions: [] as string[],
    roles: [] as string[],
    steps: [] as ApprovalStepForm[],
  });

  useEffect(() => {
    fetchDivisions();
    fetchRoles();
  }, []);

  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/work-divisions');
      if (response.ok) {
        const data = await response.json();
        setDivisions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        roleId: '',
        duration: 48, // Default 48 jam
        overtimeAction: 'NOTIFY',
      }],
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, field: keyof ApprovalStepForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/approval-schemas', {
        method: 'POST',
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
        throw new Error('Failed to create approval schema');
      }

      router.push('/workspace-management/approval-schema');
      router.refresh();
    } catch (error) {
      console.error('Error creating approval schema:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Approval Schema</h1>
      
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select Document Type</option>
              <option value="Purchase Request">Purchase Request</option>
              <option value="Memo">Memo</option>
            </select>
          </div>

          <div>
            <label className="block mb-1.5">
              Applicable Work Divisions <span className="text-red-500">*</span>
            </label>
            <select
              multiple
              value={formData.workDivisions}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFormData(prev => ({ ...prev, workDivisions: values }));
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.divisionName}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple divisions</p>
          </div>

          <div>
            <label className="block mb-1.5">
              Applicable Roles <span className="text-red-500">*</span>
            </label>
            <select
              multiple
              value={formData.roles}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFormData(prev => ({ ...prev, roles: values }));
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.roleName}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple roles</p>
          </div>

          <div>
            <label className="block mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium">Approval Steps</label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {formData.steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Step {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5">
                      Approver Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={step.roleId}
                      onChange={(e) => updateStep(index, 'roleId', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5">Specific User</label>
                    <input
                      type="text"
                      value={step.specificUserId || ''}
                      onChange={(e) => updateStep(index, 'specificUserId', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Optional"
                    />
                  </div>

                  {formData.documentType === 'Purchase Request' && (
                    <div>
                      <label className="block mb-1.5">Budget Limit</label>
                      <input
                        type="number"
                        value={step.budgetLimit || ''}
                        onChange={(e) => updateStep(index, 'budgetLimit', Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Optional"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block mb-1.5">
                      Duration (hours) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={step.duration}
                      onChange={(e) => updateStep(index, 'duration', Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5">
                      Overtime Action <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={step.overtimeAction}
                      onChange={(e) => updateStep(index, 'overtimeAction', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    >
                      <option value="NOTIFY">Notify Only</option>
                      <option value="AUTO_REJECT">Auto Reject</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
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