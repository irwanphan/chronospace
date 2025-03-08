import { Project } from "@/types/project";
import { WorkDivision } from "@/types/workDivision";

export interface Budget {
  id: string;
  title: string;
  year: number;
  workDivisionId: string;
  totalBudget: number;
  startDate: string;
  finishDate: string;
  status: string;
  project: Project;
  workDivision: WorkDivision;
  purchaseRequestStatus: string | null;
}