export type ItemStatus = 'Available' | 'In-Use' | 'Broken' | 'Low-Stock';

export interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: ItemStatus;
  quantity: number;
  threshold?: number; // For consumables
  location: string;
  description: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  assetId: string;
  assetName: string;
  userId: string;
  userName: string;
  checkoutDate: number;
  returnDate?: number;
  expectedReturnDate: number;
  status: 'active' | 'completed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'student';
  department: string;
}
