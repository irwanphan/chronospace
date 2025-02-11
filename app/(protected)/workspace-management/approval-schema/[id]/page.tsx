'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';
import Link from 'next/link';

interface ApprovalStep {
  id?: string;
  roleId: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: string;
}

interface FormData {
  name: string;
  documentType: 'Purchase Request' | 'Memo';
  workDivisions: string[];
  description: string;
  steps: ApprovalStep[];
}

export default function EditSchemaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    documentType: 'Purchase Request',
    workDivisions: [],
    description: '',
    steps: []
  });

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch(`/api/approval-schemas/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name,
            documentType: data.documentType,
            workDivisions: data.divisions.split(','),
            description: data.description || '',
            steps: data.steps.map((step: any) => ({
              id: step.id,
              roleId: step.role,
              budgetLimit: step.limit,
              duration: step.duration,
              overtimeAction: step.overtime
            }))
          });
        }
      } catch (error) {
        console.error('Error fetching schema:', error);
      }
    };

    fetchSchema();
  }, [params.id]);

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        roleId: '',
        duration: 1,
        overtimeAction: 'Notify and Wait'
      }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, field: keyof ApprovalStep, value: any) => {
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
          divisions: formData.workDivisions.join(',')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update schema');
      }

      router.push('/workspace-management/approval-schema');
      router.refresh();
    } catch (error) {
      console.error('Error updating schema:', error);
      alert(error instanceof Error ? error.message : 'Failed to update schema');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Schema</h1>

      <form onSubmit={handleSubmit} className="space-y-6 border border-gray-200 rounded-lg p-6">
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Schema Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  documentType: e.target.value as 'Purchase Request' | 'Memo',
                  steps: prev.steps.map(step => ({
                    ...step,
                    budgetLimit: e.target.value === 'Memo' ? undefined : step.budgetLimit
                  }))
                }))}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="Purchase Request">Purchase Request</option>
                <option value="Memo">Memo</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5">
                Apply to Work Division <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Research', 'Engineering'].map((division) => (
                  <label key={division} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.workDivisions.includes(division)}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          workDivisions: e.target.checked
                            ? [...prev.workDivisions, division]
                            : prev.workDivisions.filter(d => d !== division)
                        }));
                      }}
                      className="mr-2"
                    />
                    {division}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1.5">
                Schema Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5">Schema Full Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Approval Steps</h2>
            <button
              type="button"
              onClick={addStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">Role</th>
                {formData.documentType === 'Purchase Request' && (
                  <th className="text-left pb-2">Budget Limit</th>
                )}
                <th className="text-left pb-2">Duration</th>
                <th className="text-left pb-2">Overtime Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formData.steps.map((step, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">
                    <select
                      value={step.roleId}
                      onChange={(e) => updateStep(index, 'roleId', e.target.value)}
                      className="w-full px-3 py-1 border rounded"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="dept_head">Dept. Head</option>
                      <option value="finance_manager">Finance Manager</option>
                      <option value="finance_director">Finance Director</option>
                    </select>
                  </td>
                  {formData.documentType === 'Purchase Request' && (
                    <td className="py-2">
                      <input
                        type="number"
                        value={step.budgetLimit}
                        onChange={(e) => updateStep(index, 'budgetLimit', parseFloat(e.target.value))}
                        className="w-full px-3 py-1 border rounded"
                        required
                      />
                    </td>
                  )}
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={step.duration}
                        onChange={(e) => updateStep(index, 'duration', parseInt(e.target.value))}
                        className="w-20 px-3 py-1 border rounded"
                        required
                        min="1"
                      />
                      <span>days</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <select
                      value={step.overtimeAction}
                      onChange={(e) => updateStep(index, 'overtimeAction', e.target.value)}
                      className="w-full px-3 py-1 border rounded"
                      required
                    >
                      <option value="Notify and Wait">Notify and Wait</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/workspace-management/approval-schema"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
} 