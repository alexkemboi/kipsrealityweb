import { Metadata } from "next";
import UnitsClient from "@/components/Dashboard/propertymanagerdash/units/UnitsClient";

export const metadata: Metadata = {
  title: "Units | Property Manager Dashboard",
  description: "View and manage units",
};

export default function UnitsPage({
  searchParams,
}: {
  searchParams?: { occupied?: string };
}) {
  return <UnitsClient initialOccupied={searchParams?.occupied ?? null} />;
}
