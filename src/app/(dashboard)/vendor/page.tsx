"use client";

import { useState } from "react";
import Sidebar from "../../../components/Dashboard/vendordash/Sidebar";
import DashboardContent from "../../../components/Dashboard/vendordash/DashboardContent";

export default function VendorDashboard() {
  const [selected, setSelected] = useState("Dashboard Overview");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar selected={selected} onSelect={setSelected} />
      <DashboardContent selected={selected} />
    </div>
  );
}