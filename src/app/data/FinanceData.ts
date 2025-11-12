// types/finance.ts
export interface Lease {
  id: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit?: number;
  leaseStatus: 'DRAFT' | 'ACTIVE' | 'SIGNED' | 'CANCELLED';
  paymentFrequency: string;
  lateFeeDaily?: number;
  lateFeeFlat?: number;
  paymentDueDay?: number;
}

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

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: 'CASH' | 'BANK' | 'CREDIT CARD';
  reference?: string;
  paidOn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  rentAmount?: number;
  currency?: string;
  isOccupied: boolean;
  bedrooms?: number;
  bathrooms?: number;
}

export interface Utility {
  id: string;
  name: string;
  type: 'FIXED' | 'METERED';
  unitPrice?: number;
  fixedAmount?: number;
}
