'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Role } from '@/types/role';
import { User } from '@/types/user';

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stepData: StepFormData) => void;
  roles: Role[];
  users: User[];
  documentType: string;
  editData?: StepFormData;
  isEdit?: boolean;
}

interface StepFormData {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'NOTIFY' | 'AUTO_REJECT';
}

export default function AddStepModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  roles, 
  users,
  documentType,
  editData,
  isEdit = false
}: AddStepModalProps) {
  const [formData, setFormData] = useState<StepFormData>({
    roleId: '',
    specificUserId: undefined,
    budgetLimit: undefined,
    duration: 7,
    overtimeAction: 'NOTIFY',
  });

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRoleLimit, setSelectedRoleLimit] = useState<number | null>(null);

  useEffect(() => {
    if (editData) {
      const role = roles.find(r => r.id === editData.roleId);
      setSelectedRoleLimit(role?.approvalLimit || null);
      setFormData(editData);
    }
  }, [editData, roles]);

  useEffect(() => {
    if (formData.roleId) {
      const usersWithRole = users.filter(user => 
        user.role?.includes(formData.roleId)
      );
      setFilteredUsers(usersWithRole);
    } else {
      setFilteredUsers([]);
    }
  }, [formData.roleId, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleRoleChange = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    setSelectedRoleLimit(role?.approvalLimit || null);
    setFormData(prev => ({ 
      ...prev, 
      roleId,
      budgetLimit: role?.approvalLimit || undefined
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            {isEdit ? 'Edit Approval Step' : 'Add Approval Step'}
          </h2>
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
              value={formData.roleId || ''}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.roleName}</option>
              ))}
            </select>
          </div>

          {formData.roleId && (
            <div>
              <label className="block mb-1.5">
                Specific User
                <span className="text-sm text-gray-500 ml-1">
                  (Optional - Leave empty to allow any user with the selected role)
                </span>
              </label>
              <select
                value={formData.specificUserId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  specificUserId: e.target.value || undefined 
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Any user with this role</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {documentType === 'Purchase Request' && (
            <div>
              <label className="block mb-1.5">
                Budget Limit
              </label>
              <input
                type="text"
                value={selectedRoleLimit 
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(selectedRoleLimit)
                  : ''}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          )}

          <div>
            <label className="block mb-1.5">
              Duration (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                duration: Number(e.target.value)
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
                overtimeAction: e.target.value as 'NOTIFY' | 'AUTO_REJECT' 
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              required
            >
              <option value="NOTIFY">Notify and Wait</option>
              <option value="AUTO_REJECT">Auto Reject</option>
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
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEdit ? 'Save Changes' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 