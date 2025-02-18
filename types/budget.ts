export interface Budget {
  id: string;
  title: string;
  year: number;
  division: string;
  totalBudget: number;
  startDate: string;
  finishDate: string;
  status: string;
  purchaseRequestStatus: string | null;
}