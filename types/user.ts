import { Role } from "@/types/role";
import { WorkDivision } from "@/types/work-division";

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  workDivisionId: string;
  lastLogin: string;
  createdAt: string;
  address?: string;
  phone?: string;
  image?: string;
  role: Role;
  workDivision: WorkDivision;
} 