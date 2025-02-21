export interface ApprovalStep {
  id?: string;
  schemaId: string;
  order: number;
  status: string;
  role: string;
  specificUserId?: string;
  limit?: number;
  duration: number; // dalam jam
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalSchema {
  id?: string;
  name: string;
  documentType: string;
  divisions: string | string[];  // Menyimpan division codes
  roles: string | string[];
  title: string;
  description?: string;
  approvalSteps: ApprovalStep[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 