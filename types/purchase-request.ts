import { ApprovalStep } from "@/types/approval-schema";

export interface PurchaseRequest {
  id: string;
  createdAt: string;
  status: string;
  createdBy: string;
  budget: {
    project: {
      finishDate: string;
    };
    workDivision: {
      name: string;
    };
  };
  approvalSteps: ApprovalStep[];
}

export interface PurchaseRequestItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}
