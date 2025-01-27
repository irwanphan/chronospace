export interface ApprovalStep {
  id?: string;
  schemaId: string;
  stepNumber: number;
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number; // dalam jam
  overtimeAction: 'NOTIFY' | 'AUTO_REJECT';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalSchema {
  id?: string;
  name: string;
  documentType: 'Purchase Request' | 'Memo';
  description?: string;
  workDivisions: string[]; // array of division IDs
  roles: string[]; // array of role IDs yang bisa menggunakan schema ini
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 