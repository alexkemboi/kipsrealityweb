import { Metadata } from "next";
import { prisma } from "@/lib/db";
import CreateRequestForm from "@/components/Dashboard/maintenance/CreateRequestForm";
import MaintenanceRequestsClient from "@/components/Dashboard/maintenance/MaintenanceRequestsClient";

export const metadata: Metadata = {
  title: "Maintenance Requests | Property Manager Dashboard",
  description: "View and manage maintenance requests",
};

export default async function MaintenanceRequestsPage() {
  let requests: any[] = [];
  try {
    requests = await (prisma as any).maintenanceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, address: true, city: true } },
        requestedBy: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
    });
  } catch (err) {
    console.warn("MaintenanceRequest table not available yet:");
  }

  // Render a client component that handles interactive UI (toggle form, etc.)
  return <MaintenanceRequestsClient initialRequests={requests} />;
}