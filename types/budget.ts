import { Project } from "@/types/project";
import { WorkDivision } from "@/types/work-division";

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
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendor: {
    vendorId: string;
    vendorName: string;
  };
}