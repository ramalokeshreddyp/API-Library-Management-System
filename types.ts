export enum BookStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

export enum MemberStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum TransactionStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  membershipNumber: string;
  status: MemberStatus;
  joinedDate: string;
}

export interface Transaction {
  id: string;
  bookId: string;
  memberId: string;
  borrowedAt: string; // ISO Date string
  dueDate: string; // ISO Date string
  returnedAt?: string; // ISO Date string
  status: TransactionStatus;
}

export interface Fine {
  id: string;
  memberId: string;
  transactionId: string;
  amount: number;
  paidAt?: string; // ISO Date string
  createdAt: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueCount: number;
  totalFinesPending: number;
}