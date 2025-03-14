import { Project } from "@/types/project";
import { WorkDivision } from "@/types/work-division";
import { PurchaseRequestItem } from "@/types/purchase-request";

export interface Budget {
  id: string;
  code: string;
  title: string;
  year: number;
  totalBudget: number;
  startDate: string;
  finishDate: string;
  createdAt: string;
  status: string;
  projectId: string;
  project: Project;
  workDivisionId: string;
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
  purchaseRequestItems: PurchaseRequestItem[];
}