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

export interface ProjectHistory {
  id: string;
  projectId: string;
  action: string;
  details: string;
  timestamp: string;
  user: {
    name: string;
  }
}

export interface ProjectDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}