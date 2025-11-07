"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import VendorInviteForm from "./VendorInviteForm";
import type { ReactElement } from "react";

type Vendor = {
  id: string;
  companyName: string;
  serviceType: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
};

export default function VendorsClient({ initialVendors }: { initialVendors: Vendor[] }): ReactElement {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState<"ALL" | "Plumbing" | "Electrical" | "HVAC" | "General" | "Other">("ALL");

  const [vendors, setVendors] = useState<Vendor[]>(initialVendors || []);
  const handleVendorInviteSuccess = useCallback((newVendor: Vendor) => {
    setVendors(prev => [...prev, newVendor]);
    toast.success("Vendor invited successfully!");
  }, []);

  const filteredVendors = vendors.filter((vendor) => {
    const search = searchTerm.trim().toLowerCase();
    if (search) {
      const searchString = `${vendor.companyName} ${vendor.user?.firstName ?? ""} ${vendor.user?.lastName ?? ""} ${vendor.user?.email ?? ""}`.toLowerCase();
      if (!searchString.includes(search)) return false;
    }

    if (serviceType !== "ALL" && vendor.serviceType !== serviceType) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-[400px] p-6 bg-[#0f172a]">
      {/* Invite Form */}
      <VendorInviteForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleVendorInviteSuccess}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-gray-400 text-sm">Manage your maintenance service providers</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow"
        >
          Invite Vendor
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Vendors</p>
          <p className="text-3xl font-bold text-white">{vendors.length}</p>
        </div>
        </div>
      {/* Filters */}
      <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search vendors..."
              className="w-full bg-[#0a1628] border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-[#0a1628] border border-[#15386a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent min-w-40"
            value={serviceType}
            onChange={e => setServiceType(e.target.value as any)}
          >
            <option value="ALL">All Services</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="General">General Maintenance</option>
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
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Vendor Name</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Service Type</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Contact</th>
                <th className="text-left p-4 text-gray-300 font-semibold text-sm">Assigned Tasks</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-12">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-gray-400 text-lg">No vendors found</p>
                      <p className="text-gray-500 text-sm">Add vendors to manage your maintenance services</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-t border-[#15386a]/50 hover:bg-[#15386a]/20 transition-colors">
                    <td className="p-4 text-gray-200">
                      {vendor.companyName}
                      <div className="text-sm text-gray-400">
                        {vendor.user?.firstName} {vendor.user?.lastName}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#30D5C8]/20 text-[#30D5C8]">
                        {vendor.serviceType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-200">{vendor.user?.phone || "-"}</div>
                      <div className="text-sm text-gray-400">{vendor.user?.email || "-"}</div>
                    </td>
                    <td className="p-4 text-gray-200">No tasks assigned</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
