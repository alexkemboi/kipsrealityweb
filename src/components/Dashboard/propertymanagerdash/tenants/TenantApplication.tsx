"use client";

import { useEffect, useState } from "react";
import { TenantApplication } from "@/components/Dashboard/type";
import Navbar from "@/components/website/Navbar";

export default function AdminTenantApplications() {
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<TenantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");

  // Fetch applications
  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/tenant-application");
        const data = await res.json();

        if (res.ok) {
          setApplications(data);
          setFilteredApps(data);
        } else {
          setError(data.error || "Failed to fetch applications");
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  // Handle filters
  useEffect(() => {
    let filtered = [...applications];
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }
    if (propertyFilter !== "all") {
      filtered = filtered.filter((app) => app.property?.id === propertyFilter);
    }
    setFilteredApps(filtered);
  }, [statusFilter, propertyFilter, applications]);

  // Handle Approve / Reject
  async function handleAction(appId: string, action: "Approved" | "Rejected") {
    try {
      const res = await fetch(`/api/tenantapplications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: action } : app))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  if (loading) return <p className="text-center mt-16">Loading applications...</p>;
  if (error) return <p className="text-center mt-16 text-red-600">{error}</p>;

  const uniqueProperties = Array.from(
    new Set(applications.map((app) => app.property?.id).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold mb-6">Tenant Applications</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="all">All Properties</option>
            {uniqueProperties.map((id) => {
              const prop = applications.find((app) => app.property?.id === id)?.property;
              return (
                <option key={id} value={id}>
                  {prop?.name || prop?.city || "Unknown"}
                </option>
              );
            })}
          </select>
        </div>

        {filteredApps.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{app.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.property?.name || app.property?.city || "Unknown"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.status || "Pending"}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={() => handleAction(app.id, "Approved")}
                        disabled={app.status === "Approved"}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => handleAction(app.id, "Rejected")}
                        disabled={app.status === "Rejected"}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
