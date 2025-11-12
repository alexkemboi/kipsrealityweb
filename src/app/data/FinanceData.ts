// types/finance.ts
export interface Invoice {
  id: string;
  lease_id: string;
  type: 'RENT' | 'UTILITY';
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Lease {
  id: string;
  rentAmount: number;
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  paymentDueDay?: number;
  lateFeeDaily?: number;
  leaseStatus: 'DRAFT' | 'ACTIVE' | 'SIGNED' | 'CANCELLED';
}

export interface ManualInvoiceInput {
  lease_id: string;
  type: 'RENT' | 'UTILITY';
  amount: number;
  dueDate: string;
}

export interface FullInvoiceInput {
  lease_id: string;
  type: 'RENT' | 'UTILITY';
}
