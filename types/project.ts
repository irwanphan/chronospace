export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  workDivisionId: string;
  status: string;
  startDate: string;
  finishDate: string;
  year: number;
  workDivision: {
    id: string;
    name: string;
  };
}