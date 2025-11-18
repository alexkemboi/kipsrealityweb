"use client";

import React, { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  vendors?: { user?: { firstName?: string; lastName?: string }; companyName?: string | null };
  cost?: string;
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
  const router = useRouter();
  const loggedInUser = `${user?.firstName ?? ""}_${user?.lastName ?? ""}`;
  const organizationId = user?.organization?.id;
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  
    async function fetchRequests() {
      if (!organizationId) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/maintenance?organizationId=${organizationId}`);
        if (!res.ok) console.error("Failed to fetch requests");
        const data = await res.json();
        setRequests(data);
      } catch (error) { console.error("Error fetching maintenance requests:", error); }
      finally { setLoading(false); }
    }
    
    useEffect(() => {
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

  // Get unique property names for dropdown
  const propertyNames = Array.from(new Set(requests.map(r => r.property?.name).filter(Boolean)));

  const filteredRequests = requests.filter((r) => {
    // Filter by property name if selected
    if (propertyFilter !== "all" && r.property?.name !== propertyFilter) return false;
    const search = searchTerm.trim().toLowerCase();
    if (search) {
      const prop = `${r.property?.address ?? ""} ${r.property?.city ?? ""}`.toLowerCase();
      if (!prop.includes(search) && !(r.title ?? "").toLowerCase().includes(search)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="min-h-[400px] p-6 bg-white text-gray-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          <p className="text-gray-600 text-sm">Track property issues, repairs and service needs</p>
        </div>
        <div className="flex flex-row flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow"
          >
            Make Request
          </button>
          <Link href="/property-manager/maintenance/vendors" legacyBehavior>
            <a className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white shadow">
              View Invites
            </a>
          </Link>
          {/* <a
            href="/property-manager/maintenance/vendors/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white shadow"
          >
            Add Vendor
          </a> */}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg w-full max-w-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Create Maintenance Request</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-900 text-xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <CreateRequestForm organizationId={organizationId}
              onSuccess={() => {
                fetchRequests();
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Requests Assigned</p>
          <p className="text-3xl font-bold">{requests.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Open Requests</p>
          <p className="text-3xl font-bold text-yellow-600">
            {requests.filter((r) => (r.status ?? "").toLowerCase().includes("open")).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Requests Completed</p>
          <p className="text-3xl font-bold text-emerald-600">
            {requests.filter((r) => !(r.status ?? "").toLowerCase().includes("open")).length}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by description..."
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Property filter dropdown */}
          <div>
            <select
              className="bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent min-w-40"
              value={propertyFilter ?? "all"}
              onChange={e => setPropertyFilter(e.target.value)}
            >
              <option value="all">All Properties</option>
              {propertyNames.map(name => (
                <option key={name} value={name ?? ''}>{name}</option>
              ))}
            </select>
          </div>

          {organizationId && (
            <div className="flex gap-2">
              <select
                className="bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent min-w-40"
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
                <option value="Export">Export</option>
                <option value="Excel">Excel sheet</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Title</th>
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Description</th>
                {/* <th className="text-left p-2 text-gray-700 font-semibold text-sm">Property</th>
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Address</th> */}
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Priority</th>
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Status</th>
                {/* <th className="text-left p-2 text-gray-700 font-semibold text-sm">Requested</th> */}
                {/* <th className="text-left p-2 text-gray-700 font-semibold text-sm">Category</th> */}
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Cost</th>
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Assign to</th>
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Unit</th>
                <th className="text-left p-2 text-gray-700 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-2 text-gray-900">{r.title}</td>
                  <td className="p-2 text-gray-900">
                    {r.description.length > 15 ? `${r.description.slice(0, 15)}...` : r.description}
                  </td>
                  {/* <td className="p-2 text-gray-900">{r.property?.name}</td>
                  <td className="p-2 text-gray-900">{r.property?.city}</td> */}
                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${r.priority === "LOW" ? "bg-gray-200 text-gray-800"
                          : r.priority === "NORMAL" ? "bg-green-100 text-green-800"
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
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  {/* <td className="p-2 text-gray-900">
                    {r.requestedBy?.user?.firstName ?? "Unknown"} {r.requestedBy?.user?.lastName?.charAt(0) ?? ""}
                  </td> */}
                  {/* <td className="p-2 text-gray-900">{r.category?.toLowerCase() ?? "standard"}</td> */}
                  <td className="p-2 text-gray-900">{r.cost ?? "-"}</td>
                  <td className="p-2 text-gray-900">
                    {r.vendors ? (
                      r.vendors.companyName
                        ? r.vendors.companyName
                        : `${r.vendors.user?.firstName ?? ""} ${r.vendors.user?.lastName ? r.vendors.user.lastName.charAt(0) + "." : ""}`.trim()
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 text-gray-900">
                    {r.unit?.unitName ? r.unit.unitName : r.unit?.unitNumber ?? "-"}
                  </td>
                  <td className="p-2 text-gray-900"> 
                    <button 
                      onClick={() => setSelectedRequest(r)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                      {selectedRequest && (
                      <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 p-4">

                          <div className="bg-white border border-gray-200 rounded-lg w-full max-w-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="mb-6 flex justify-between items-center">
                              <h3 className="text-2xl font-bold text-gray-900">{`Maintenance Details for ${selectedRequest.property?.name ?? '-'} unit ${selectedRequest.unit?.unitName ?? selectedRequest.unit?.unitNumber ?? '-'}`}</h3>
                              <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-900 text-xl font-bold"
                                aria-label="Close"
                              >
                                ×
                              </button>
                            </div>
                            <div className="space-y-3">
                              <div><strong>Property:</strong> {selectedRequest.property?.name ?? '-'} ({selectedRequest.property?.address ?? ''} {selectedRequest.property?.city ?? ''})</div>
                              <div><strong>Title:</strong> {selectedRequest.title}</div>
                              <div><strong>Description:</strong> {selectedRequest.description}</div>
                              <div><strong>Priority:</strong> {selectedRequest.priority}</div>
                              <div><strong>Status:</strong> {selectedRequest.status}</div>
                              <div><strong>Category:</strong> {selectedRequest.category ?? '-'}</div>
                              <div><strong>Cost:</strong> {selectedRequest.cost ?? '-'}</div>
                              <div><strong>Created At:</strong> {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : '-'}</div>
                              <div><strong>Unit:</strong> {selectedRequest.unit?.unitName ?? selectedRequest.unit?.unitNumber ?? '-'}</div>
                              <div><strong>Requested By:</strong> {selectedRequest.requestedBy?.user ? `${selectedRequest.requestedBy.user.firstName ?? ''} ${selectedRequest.requestedBy.user.lastName ?? ''}` : '-'}</div>
                              <div><strong>Assigned Vendor:</strong> {selectedRequest.vendors?.companyName ? selectedRequest.vendors.companyName : `${selectedRequest.vendors?.user?.firstName ?? ''} ${selectedRequest.vendors?.user?.lastName ?? ''}`}</div>
                            </div>
                          </div>
                        </div>
                      )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
