export interface ApprovalStep {
  id?: string;
  schemaId: string;
  stepNumber: number;
  roleId: string;
  specificUserId?: string;
  limit?: number;
  duration: number; // dalam jam
  overtimeAction: 'NOTIFY' | 'AUTO_REJECT';
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
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 