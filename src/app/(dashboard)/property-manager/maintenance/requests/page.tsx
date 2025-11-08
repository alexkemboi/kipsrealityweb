import { Metadata } from "next";
import { prisma } from "@/lib/db";
import CreateRequestForm from "@/components/Dashboard/maintenance/CreateRequestForm";
import MaintenanceRequestsClient from "@/components/Dashboard/maintenance/MaintenanceRequestsClient";

export const metadata: Metadata = {
  title: "Maintenance Requests | Property Manager Dashboard",
  description: "View and manage maintenance requests",
};

export default function MaintenanceRequestsPage() {
  return <MaintenanceRequestsClient />;
}