export interface Vendor {
  id?: string;
  vendorCode: string;
  vendorName: string;
  address: string;
  phone: string;
  email: string;
  documents?: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 