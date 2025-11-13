"use client";

import React, { useState, useEffect } from "react";
import type { ReactElement } from "react";
import CreateRequestForm from "./CreateRequestForm";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Request = {
  id: string;
  title: string;
  description: string;
  propertyId?: string;
  unitId?: string;
  priority: string;
  status: string;
  category?: string;
  requestedBy?: { user?: { firstName?: string; lastName?: string } };
  createdAt?: string;
  property?: { address?: string | null; name?: string | null; city?: string | null };
  unit?: { unitNumber: string; unitName?: string | null };
  assignedVendor?: { user?: { firstName?: string; lastName?: string }; companyName?: string | null };
  // prisma relation currently named `vendors` on MaintenanceRequest model
  vendors?: { user?: { firstName?: string; lastName?: string }; companyName?: string | null };
};

function handleExcel(data: any, filename = "maintenance_requests.xlsx", username: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 20 }, { wch: 50 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 25 },
  ];
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "");
  const headerRowIndex = 0;
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell_address = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
    const cell = worksheet[cell_address];
    if (cell) cell.s = { font: { bold: true } };
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${username}_${filename}`);
}

function handleCSV(data: any, filename = "maintenance_requests.csv", username: string) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map((row: any) =>
    headers.map((header) => {
      const value = row[header] ?? "";
      return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(",")
  );
  const csvString = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${username}_${filename}`);
}

export default function MaintenanceRequestsClient(): ReactElement {
  const { user } = useAuth();
  const loggedInUser = `${user?.firstName ?? ""}_${user?.lastName ?? ""}`;
  const organizationId = user?.organization?.id;
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportFormat, setExportFormat] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      if (!organizationId) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/maintenance?organizationId=${organizationId}`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setRequests(data);
      } catch (error) { console.error("Error fetching maintenance requests:", error); }
      finally { setLoading(false); }
    }
    fetchRequests();
  }, [organizationId]);

  function flattenRequestsForExcel(data: Request[]) {
    const capFirst = (s?: string | null) => s && s.length > 0 ? s.charAt(0) + s.slice(1) : "";
    return data.map((r) => ({
      TITLE: capFirst(r.title),
      DESCRIPTION: capFirst(r.description),
      PROPERTY_NAME: capFirst(r.property?.name),
      ADDRESS: capFirst(r.property?.city),
      UNIT: r.unit?.unitName ?? r.unit?.unitNumber ?? "",
      PRIORITY: r.priority ?? "",
      STATUS: r.status ?? "",
      REQUESTED_BY: `${capFirst(r.requestedBy?.user?.firstName)} ${capFirst(r.requestedBy?.user?.lastName)}`.trim(),
      CATEGORY: capFirst(r.category),
      CreatedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
    }));
  }

  const filteredRequests = requests.filter((r) => {
    const search = searchTerm.trim().toLowerCase();
    if (search) {
      const prop = `${r.property?.address ?? ""} ${r.property?.city ?? ""}`.toLowerCase();
      if (!prop.includes(search) && !(r.title ?? "").toLowerCase().includes(search)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-[400px] p-6 bg-[#0f172a]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance Requests</h1>
          <p className="text-gray-400 text-sm">Track property issues, repairs and service needs</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow"
        >
          Make Request
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          
            <CreateRequestForm organizationId={organizationId} onSuccess={() => setShowForm(false)} />
          
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Requests Assigned</p>
          <p className="text-3xl font-bold text-white">{requests.length}</p>
        </div>
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Open Requests</p>
          <p className="text-3xl font-bold text-yellow-400">
            {requests.filter((r) => (r.status ?? "").toLowerCase().includes("open")).length}
          </p>
        </div>
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Requests Completed</p>
          <p className="text-3xl font-bold text-[#30D5C8]">
            {requests.filter((r) => !(r.status ?? "").toLowerCase().includes("open")).length}
          </p>
        </div>
      </div>

      <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by property..."
              className="w-full bg-[#0a1628] border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {organizationId && (
            <div className="flex gap-2">
              <select
                className="bg-emerald-600 border border-[#15386a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent min-w-40"
                value={exportFormat}
                onChange={(e) => {
                  const value = e.target.value;
                  setExportFormat(value);
                  if (value === "Excel") {
                    toast.success("Your Excel file is downloading...");
                    handleExcel(flattenRequestsForExcel(requests), "maintenance_requests.xlsx", loggedInUser);
                    setExportFormat("Export");
                  }
                  if (value === "CSV") {
                    toast.success("Your CSV file is downloading...");
                    handleCSV(flattenRequestsForExcel(requests), "maintenance_requests.csv", loggedInUser);
                    setExportFormat("Export");
                  }
                }}
              >
                <option value="Export" className="bg-grey">Export</option>
                <option value="Excel" className="bg-grey">Excel sheet</option>
                <option value="CSV" className="bg-grey">CSV</option>
              </select>


            </div>
          )}
        </div>
      </div>

      <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#15386a]/50">
              <tr>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Title</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Description</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Property</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Address</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Priority</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Status</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Requested</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Category</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Cost</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Assign to</th>
                <th className="text-left p-2 text-gray-300 font-semibold text-sm">Unit</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id} className="border-t border-[#15386a]/50 hover:bg-[#15386a]/20 transition-colors">
                  <td className="p-2 text-gray-200">{r.title}</td>
                  <td className="p-2 text-gray-200">
                    {r.description.length > 15 ? `${r.description.slice(0, 15)}...` : r.description}
                  </td>
                  <td className="p-2 text-gray-200">{r.property?.name}</td>
                  <td className="p-2 text-gray-200">{r.property?.city}</td>
                  <td className="p-2 text-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${r.priority === "LOW" ? "bg-gray-300 text-gray-800"
                          : r.priority === "NORMAL" ? "bg-green-200 text-green-800"
                          : r.priority === "HIGH" ? "bg-green-600 text-white"
                          : r.priority === "URGENT" ? "bg-red-500 text-white"
                          : "bg-orange-400 text-white"}`}
                    >
                      {r.priority ? r.priority.charAt(0) + r.priority.slice(1).toLowerCase() : ""}
                    </span>
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (r.status ?? "").toLowerCase().includes("open")
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-[#30D5C8]/20 text-[#30D5C8]"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2 text-gray-200">
                    {r.requestedBy?.user?.firstName ?? "Unknown"} {r.requestedBy?.user?.lastName?.charAt(0) ?? ""}
                  </td>
                  <td className="p-2 text-gray-200">{r.category?.toLowerCase() ?? "STANDARD".toLowerCase()}</td>
                  <td className="p-2 text-gray-200">200/=</td>
                  <td className="p-2 text-gray-200">
                    {r.vendors ? (
                      r.vendors.companyName || `${r.vendors.user?.firstName ?? ""} ${r.vendors.user?.lastName ?? ""}`.trim()
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 text-gray-200">
                    {r.unit?.unitName ? r.unit.unitName : r.unit?.unitNumber ? r.unit.unitNumber : "-"}
                  </td>
                  <td className="p-2"></td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-12">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-gray-400 text-lg">No requests found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your filters or create a new request</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
