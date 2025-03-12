export interface ApprovalSchema {
  id: string;
  name: string;
  description: string;
  documentType: string;
  approvalSteps: {
    role: {
      roleName: string;
    };
    roleId: string;
    specificUserId?: string;
    duration: number;
    overtimeAction: 'Notify and Wait' | 'Auto Decline';
    budgetLimit?: number;
    stepOrder: number;
  }[];
} 