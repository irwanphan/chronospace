'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { formatDate } from '@/lib/utils';
import AddStepModal from '@/components/AddStepModal';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import { ApprovalSchema } from '@/types/approval-schema';
import { useSession } from 'next-auth/react';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from 'react-hot-toast';

export default function EditPurchaseRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ data: ApprovalStepForm; index: number } | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [schemas, setSchemas] = useState<ApprovalSchema[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    budgetId: '',
    projectId: '',
    title: '',
    createdBy: '',
    description: '',
    items: [] as BudgetItem[],
    steps: [] as ApprovalStepForm[],
  });

  // Fetch existing PR data
  useEffect(() => {
    const fetchPurchaseRequest = async () => {
      try {
        const response = await fetch(`/api/workspace/purchase-requests/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch purchase request');
        
        const data = await response.json();
        setFormData({
          code: data.code,
          budgetId: data.budgetId,
          projectId: data.projectId,
          title: data.title,
          createdBy: data.createdBy,
          description: data.description,
          items: [],
          steps: data.approvalSteps.map((step: any) => ({
            roleId: step.role,
            specificUserId: step.specificUserId,
            limit: step.limit,
            duration: step.duration,
            overtimeAction: step.overtimeAction === 'NOTIFY' ? 'Notify and Wait' : 'Auto Decline'
          }))
        });
        setSelectedItems(data.items);
      } catch (error) {
        console.error('Error fetching purchase request:', error);
        toast.error('Failed to fetch purchase request');
      }
    };

    fetchPurchaseRequest();
  }, [params.id]);

  // Fetch supporting data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/workspace/purchase-requests/fetch-roles-schemas-users-availablebudgets');
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles);
          setUsers(data.users);
          setSchemas(data.schemas);
          setBudgetPlans(data.availableBudgets);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/workspace/purchase-requests/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: selectedItems,
          createdBy: session?.user?.id || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      router.push('/workspace');
      router.refresh();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sisanya sama dengan halaman new
  // ... (copy semua handler dan JSX dari halaman new)

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Edit Purchase Request</h1>
      
      {/* Request Info Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200 bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500">
              ID: <span className="font-semibold text-gray-900">{formData.code}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
        {/* Copy semua form fields dari halaman new */}
      </form>

      {/* Modals */}
      {/* Copy semua modal components dari halaman new */}
    </div>
  );
} 