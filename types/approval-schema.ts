export interface ApprovalSchema {
  id: string;
  name: string;
  description: string;
  documentType: string;
  steps: {
    role: string;
    duration: number;
    overtime: 'NOTIFY' | 'AUTO_REJECT';
  }[];
} 