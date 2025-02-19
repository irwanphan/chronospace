export interface Budget {
  id: string;
  title: string;
  year: number;
  workDivisionId: string;
  totalBudget: number;
  startDate: string;
  finishDate: string;
  status: string;
  purchaseRequestStatus: string | null;
}