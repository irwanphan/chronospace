import { Role } from "./role";
import { User } from "./user";
import { WorkDivision } from "./workDivision";

export interface ApprovalStep {
  id?: string;
  schemaId: string;
  order: number;
  status: string;
  roleId: string;
  role: Role;
  specificUserId?: string;
  specificUser?: User;
  budgetLimit?: number;
  duration: number; // dalam jam
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalSchema {
  id?: string;
  name: string;
  documentType: string;
  workDivisionIds: string | string[];  // Menyimpan division codes
  roleIds: string | string[];
  title: string;
  description?: string;
  approvalSteps: ApprovalStep[];
  isActive: boolean;
  applicableWorkDivisions: WorkDivision[];
  applicableRoles: Role[];
  createdAt?: Date;
  updatedAt?: Date;
} 