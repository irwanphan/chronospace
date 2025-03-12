export interface Project {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
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