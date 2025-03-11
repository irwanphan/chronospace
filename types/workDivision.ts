import { User } from "./user";

export interface WorkDivision {
  id: string;
  code: string;
  name: string;
  description: string;
  upperWorkDivisionId?: string; // Parent division ID
  headId?: string;  // Role ID of division head
  createdAt?: Date;
  updatedAt?: Date;
  head?: User;
  upperWorkDivision?: WorkDivision;
  subDivisions?: WorkDivision[];
} 