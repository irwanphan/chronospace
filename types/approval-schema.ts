export interface ApprovalSchema {
  id: string;
  name: string;
  description: string;
  documentType: string;
  approvalSteps: {
    role: {
      id: string;
      roleName: string;
    };
    roleId: string;
    specificUserId?: string;
    specificUser: {
      id: string;
      name: string;
    };
    duration: number;
    overtimeAction: 'Notify and Wait' | 'Auto Decline';
    budgetLimit?: number;
    stepOrder: number;
  }[];
} 