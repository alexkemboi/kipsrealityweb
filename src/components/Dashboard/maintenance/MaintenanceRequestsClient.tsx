"use client";

import React, { useState } from "react";
import type { ReactElement } from "react";
import CreateRequestForm from "./CreateRequestForm";

type Request = {
  id: string;
  title: string;
  description: string;
  propertyId?: string;
  priority: string;
  status: string;
  requestedBy?: {
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
  createdAt?: string;
  property?: {
    address?: string | null;
    city?: string | null;
  };
};

export default function MaintenanceRequestsClient({ initialRequests }: { initialRequests: Request[] }): ReactElement {
  const organizationId = "b84257cd-f9d9-47cb-b214-b7317020d505";  // Updated to match your organization
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [emergencyType, setEmergencyType] = useState<"ALL" | "Plumbing" | "Electrical" | "Heating" | "Security" | "Other">("ALL");

  const requests = initialRequests || [];

  const filteredRequests = requests.filter((r) => {
    const search = searchTerm.trim().toLowerCase();
    if (search) {
      const prop = `${r.property?.address ?? ""} ${r.property?.city ?? ""}`.toLowerCase();
      if (!prop.includes(search) && !(r.title ?? "").toLowerCase().includes(search)) return false;
    }

    // Emergency type filter placeholder
    if (emergencyType !== "ALL") {
      // No emergency field in DB yet, leave as passthrough
    }

    return true;
  });

  return (
    <div className="min-h-[400px] p-6 bg-[#0f172a]">
      {/* Header */}
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

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-medium mb-3">Create a Request</h4>
            <CreateRequestForm organizationId={organizationId} onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Requests Assigned</p>
          <p className="text-3xl font-bold text-white">{requests.length}</p>
        </div>
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">{requests.filter(r => (r.status ?? '').toLowerCase().includes('open')).length}</p>
        </div>
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Requests Accepted</p>
          <p className="text-3xl font-bold text-[#30D5C8]">{requests.filter(r => !(r.status ?? '').toLowerCase().includes('open')).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by property..."
              className="w-full bg-[#0a1628] border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-[#0a1628] border border-[#15386a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent min-w-40"
            value={emergencyType}
            onChange={e => setEmergencyType(e.target.value as any)}
          >
            <option value="ALL">All Emergency Types</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Heating">Heating</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#15386a]/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Title</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Description</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Property</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Priority</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Status</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Requested By</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id} className="border-t border-[#15386a]/50 hover:bg-[#15386a]/20 transition-colors">
                  <td className="p-4 text-gray-200">{r.title}</td>
                  <td className="p-4 text-gray-200">{r.description.length > 40 ? `${r.description.slice(0, 40)}...` : r.description}</td>
                  <td className="p-4 text-gray-200">{r.property?.address ?? r.propertyId} {r.property?.city ? `— ${r.property.city}` : ''}</td>
                  <td className="p-4 text-gray-200">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{r.priority}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ (r.status ?? '').toLowerCase().includes('open') ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#30D5C8]/20 text-[#30D5C8]' }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-200">{r.requestedBy?.user?.firstName ?? 'Unknown'} {r.requestedBy?.user?.lastName ?? ''}</td>
                  <td className="p-4 text-gray-400 text-sm">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-12">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
