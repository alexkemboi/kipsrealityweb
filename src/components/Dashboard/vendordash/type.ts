import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

export interface Metric {
  id: number;
  title: string;
  value: number | string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  trend: string;
}

export interface WorkOrder {
  id: number;
  title: string;
  property: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  priority: "High" | "Medium" | "Low";
  assignedDate: string;
  dueDate: string;
  tenant: string;
  description: string;
  beforePhoto?: string | null;
  afterPhoto?: string | null;
}

export interface Invoice {
  id: number;
  property: string;
  amount: number;
  status: "Paid" | "Pending";
  date: string;
}

export interface Certification {
  id: number;
  name: string;
  documentUrl: string;
}

export interface Profile {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  certifications: Certification[];
  securitySettings: {
    twoFactorAuth: boolean;
    passwordLastChanged: string;
  };
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  date: string;
}

export interface AnalyticsData {
  monthlyCompletion: { month: string; completed: number }[];
  slaCompliance: { property: string; sla: number }[];
}
