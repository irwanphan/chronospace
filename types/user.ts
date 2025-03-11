import { Role, WorkDivision } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  workDivisionId: string;
  lastLogin: string;
  createdAt: string;
  image?: string;
  role: Role;
  workDivision: WorkDivision;
} 