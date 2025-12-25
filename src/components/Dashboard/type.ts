export interface Service {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  features: string[];
  impact: string;
  icon: string;
}

export interface Category {
  id: number;
  name: string;
  tagline: string;
  color: string;
  services: Service[];
}

export interface CategoryFormData {
  id: number;
  name: string;
  tagline: string;
  color: string;
}

export interface ServiceFormData {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  features: string | string[];
  impact: string;
  icon: string;
}


export type Unit = {
  id: string;
  unitNumber: string;
  floorNumber?: number;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount?: number;

};

export type TenantApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  ssn?: string | null;
  address?: string | null;
  employerName?: string | null;
  jobTitle?: string | null;
  monthlyIncome?: number | null;
  employmentDuration?: string | null;
  leaseType: string;
  occupancyType: string;
  moveInDate: string;
  leaseDuration: string;
  occupants?: number | null;
  pets?: string | null;
  landlordName?: string | null;
  landlordContact?: string | null;
  reasonForMoving?: string | null;
  referenceName?: string | null;
  referenceContact?: string | null;
  consent: boolean;
  propertyId: string;
  userId?: string | null;
  unitId?: string | null;
  status?: "Pending" | "Approved" | "Rejected" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    name?: string;
    city?: string;
  };
  unit?: {
    id: string;
    unitNumber: string;
    floorNumber?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    rentAmount?: number | null;
    isOccupied: boolean;
    tenantName?: string | null;
  } | null;
};