export interface Service {
  id: number;
  category_id: number;
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
  category_id: number;
  name: string;
  description: string;
   features: string | string[];
  impact: string;
  icon: string;
}

export interface TenantApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  propertyId: string;
  property?: {
    id: string;
    name?: string;
    city: string;
  };
  userId?: string;
  status?: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}
