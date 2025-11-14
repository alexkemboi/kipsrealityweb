// types/finance.ts
export interface Invoice {
  id: string;
  lease_id: string;
  type: "RENT" | "UTILITY";
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: string;
  updatedAt: string;
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

