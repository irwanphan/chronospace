export interface ApprovalSchema {
  id: string;
  name: string;
  description: string;
  documentType: string;
  steps: {
    role: string;
    specificUserId?: string;
    duration: number;
    overtimeAction: 'Notify and Wait' | 'Auto Decline';
    limit?: number;
  }[];
} 