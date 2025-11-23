// types/finance.ts

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: string; // or use a union type if you know the possible values
  reference?: string;
  paidOn?: string;
  createdAt?: string;
  updatedAt?: string;
  is_reversed: boolean;
  reversed_at?: string;
  reversal_reason?: string;
  reversed_by?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  notes?: string;
  // Add other InvoiceItem fields from your Prisma model if needed
}

export interface Invoice {
  id: string;
  lease_id: string;
  type: "RENT" | "UTILITY";
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: string;
  updatedAt: string;
  InvoiceItem: InvoiceItem[];
  payment: Payment[];
  Lease?: {
    tenant?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    property?: {
      name?: string;
      address?: string;
    };
     lease_utility?: {
      utility: {
        id: string;
        name: string;
        type: "FIXED" | "METERED";
        fixedAmount?: number;
        unitPrice?: number;
      };
      is_tenant_responsible?: boolean;
    }[];
  };
  utilities?: {
    id: string;
    name: string;
    type: "FIXED" | "METERED";
    fixedAmount?: number;
    unitPrice?: number;
    isTenantResponsible?: boolean;
  }[];
};
 


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

export interface ManualInvoiceItem {
  utilityId: string;
  description: string;
  amount: number;
}

export interface ManualUtilityItem {
  id: string; // could be utility id
  description: string;
  type: "FIXED" | "METERED";
  units: number; // number of units (only relevant for metered)
  amount: number; // cost per unit or fixed amount
   fixedAmount?: number;
  unitPrice?: number;
}

export interface UtilityItem {
  id: string;
  name: string;
  type: "FIXED" | "METERED";
  unitPrice?: number;
  units?: number;
  fixedAmount?: number;
  amount?: number;
}

export interface GroupedInvoice {
  leaseId: string;
  date: string;
  totalAmount: number;
  invoices: Invoice[];
  totalPaid?: number;        // optional, if you track payments per group
  tenant?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  property?: {
    id?: string;
    name?: string;
    address?: string;
  };
  unit?: {
    id?: string;
    unitNumber?: string;
  };
}