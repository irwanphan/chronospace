export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
  upperLevel?: string; // Parent role ID
  budgetLimit: number;
  createdAt?: Date;
  updatedAt?: Date;
} 