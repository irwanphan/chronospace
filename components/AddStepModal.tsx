'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Role } from '@/types/role';

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stepData: StepFormData) => void;
  roles: Role[];
  documentType: string;
}

interface StepFormData {
  roleId: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'NOTIFY' | 'REJECT';
}

export default function AddStepModal({ isOpen, onClose, onSubmit, roles, documentType }: AddStepModalProps) {
  const [formData, setFormData] = useState<StepFormData>({
    roleId: '',
    budgetLimit: undefined,
    duration: 48, // Default 2 days
    overtimeAction: 'NOTIFY',
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        roleId: '',
        budgetLimit: undefined,
        duration: 48,
        overtimeAction: 'NOTIFY',
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Add Approval Step</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>

          {documentType === 'Purchase Request' && (
            <div>
              <label className="block mb-1.5">
                Budget Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.budgetLimit || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  budgetLimit: e.target.value ? Number(e.target.value) : undefined 
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., 50000000"
                required={documentType === 'Purchase Request'}
              />
            </div>
          )}

          <div>
            <label className="block mb-1.5">
              Duration (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.duration / 24} // Convert hours to days for better UX
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                duration: Number(e.target.value) * 24 
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5">
              Overtime Action <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.overtimeAction}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                overtimeAction: e.target.value as 'NOTIFY' | 'REJECT' 
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="NOTIFY">Notify and Wait</option>
              <option value="REJECT">Auto Reject</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 