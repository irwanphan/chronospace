import { Project } from "@/types/project";
import { WorkDivision } from "@/types/workDivision";

export interface Budget {
  id: string;
  code: string;
  title: string;
  year: number;
  workDivisionId: string;
  totalBudget: number;
  startDate: string;
  finishDate: string;
  createdAt: string;
  status: string;
  project: Project;
  workDivision: WorkDivision;
  purchaseRequestStatus: string | null;
}