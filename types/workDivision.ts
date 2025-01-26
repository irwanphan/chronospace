export interface WorkDivision {
  id?: string;
  divisionCode: string;
  divisionName: string;
  description: string;
  upperDivision?: string; // Parent division ID
  divisionHead?: string;  // Role ID of division head
  createdAt?: Date;
  updatedAt?: Date;
} 