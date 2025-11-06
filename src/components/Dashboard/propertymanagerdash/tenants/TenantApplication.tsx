"use client";

import { useEffect, useState } from "react";
import { TenantApplication } from "@/components/Dashboard/type";
import { FileDown, Eye, Check, X, FileText, Search } from "lucide-react";

export default function AdminTenantApplications() {
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<TenantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<TenantApplication | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  // Handle filters and search
  useEffect(() => {
    let filtered = [...applications];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }
    
    if (propertyFilter !== "all") {
      filtered = filtered.filter((app) => app.property?.id === propertyFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter((app) =>
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm)
      );
    }
    
    setFilteredApps(filtered);
  }, [statusFilter, propertyFilter, searchTerm, applications]);

  // Handle Approve
  async function handleApprove(appId: string) {
    try {
      const res = await fetch(`/api/tenant-applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }),
      });
      
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: "Approved" } : app))
        );
        setShowModal(false);
        alert("Application approved! You can now proceed to lease signing.");
      }
    } catch (err) {
      console.error("Error approving application:", err);
      alert("Failed to approve application");
    }
  }

  // Handle Reject
  async function handleReject(appId: string) {
    try {
      const res = await fetch(`/api/tenantapplications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" }),
      });
      
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: "Rejected" } : app))
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert("Failed to reject application");
    }
  }

  // Proceed to Lease Signing
  function proceedToLease(app: TenantApplication) {
    // Navigate to lease signing page with application data
    const userId = app.id || app.id;
    window.location.href = `/admin/lease-signing?applicationId=${app.id}&tenantId=${userId}`;
  }

  // Export to CSV
  function exportToCSV() {
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "DOB",
      "Property",
      "Unit Number",
      "Rent Amount",
      "Move-in Date",
      "Lease Type",
      "Lease Duration",
      "Occupancy Type",
      "Occupants",
      "Employer Name",
      "Job Title",
      "Monthly Income",
      "Employment Duration",
      "Status",
      "Date Submitted"
    ];

    const rows = filteredApps.map((app) => [
      app.fullName,
      app.email,
      app.phone,
      new Date(app.dob).toLocaleDateString(),
      app.property?.name || app.property?.city || "Unknown",
      app.unit?.unitNumber || "N/A",
      app.unit?.rentAmount || "N/A",
      new Date(app.moveInDate).toLocaleDateString(),
      app.leaseType || "N/A",
      app.leaseDuration || "N/A",
      app.occupancyType || "N/A",
      app.occupants || "N/A",
      app.employerName || "N/A",
      app.jobTitle || "N/A",
      app.monthlyIncome || "N/A",
      app.employmentDuration || "N/A",
      app.status || "Pending",
      new Date(app.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenant-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Export to JSON
  function exportToJSON() {
    const dataStr = JSON.stringify(filteredApps, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenant-applications-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-center mt-16">Loading applications...</p>;
  if (error) return <p className="text-center mt-16 text-red-600">{error}</p>;

  const uniqueProperties = Array.from(
    new Set(applications.map((app) => app.property?.id).filter(Boolean))
  );

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "Pending" || app.status === "PENDING").length,
    approved: applications.filter((app) => app.status === "Approved" || app.status === "APPROVED").length,
    rejected: applications.filter((app) => app.status === "Rejected" || app.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Application Management</h1>
          <p className="text-gray-600 mt-2">Review and manage tenant applications for your properties</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
            <p className="text-sm text-yellow-800 font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 bg-green-50">
            <p className="text-sm text-green-800 font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{stats.approved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 bg-red-50">
            <p className="text-sm text-red-800 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-900 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileDown className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={exportToJSON}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileDown className="h-4 w-4" />
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications found matching your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property & Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Move-in Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{app.fullName}</span>
                          <span className="text-sm text-gray-500">{app.email}</span>
                          <span className="text-sm text-gray-500">{app.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {app.property?.name || app.property?.city || "Unknown"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Unit {app.unit?.unitNumber || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          ${app.unit?.rentAmount?.toLocaleString() || "N/A"}
                        </span>
                        <span className="text-sm text-gray-500">/month</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.moveInDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            app.status === "Approved" || app.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : app.status === "Rejected" || app.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {app.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowModal(true);
                            }}
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {(app.status === "Approved" || app.status === "APPROVED") && (
                            <button
                              onClick={() => proceedToLease(app)}
                              className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              Lease
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Application Detail Modal */}
        {showModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                    <p className="text-gray-600 mt-1">Review complete application information</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedApp.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedApp.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedApp.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedApp.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Address</p>
                      <p className="font-medium text-gray-900">{selectedApp.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SSN</p>
                      <p className="font-medium text-gray-900">{selectedApp.ssn ? "***-**-" + selectedApp.ssn.slice(-4) : "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Property & Unit Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property & Unit Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Property</p>
                      <p className="font-medium text-gray-900">
                        {selectedApp.property?.name || selectedApp.property?.city || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit Number</p>
                      <p className="font-medium text-gray-900">{selectedApp.unit?.unitNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Rent</p>
                      <p className="font-medium text-gray-900">
                        ${selectedApp.unit?.rentAmount?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Floor Number</p>
                      <p className="font-medium text-gray-900">{selectedApp.unit?.floorNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bedrooms / Bathrooms</p>
                      <p className="font-medium text-gray-900">
                        {selectedApp.unit?.bedrooms || "N/A"} bed / {selectedApp.unit?.bathrooms || "N/A"} bath
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lease Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Desired Move-in Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedApp.moveInDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lease Duration</p>
                      <p className="font-medium text-gray-900">{selectedApp.leaseDuration || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lease Type</p>
                      <p className="font-medium text-gray-900">{selectedApp.leaseType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Occupancy Type</p>
                      <p className="font-medium text-gray-900">{selectedApp.occupancyType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Number of Occupants</p>
                      <p className="font-medium text-gray-900">{selectedApp.occupants || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pets</p>
                      <p className="font-medium text-gray-900">{selectedApp.pets || "None"}</p>
                    </div>
                  </div>
                </div>

                {/* Employment & Financial Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment & Financial</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Employer Name</p>
                      <p className="font-medium text-gray-900">{selectedApp.employerName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Job Title</p>
                      <p className="font-medium text-gray-900">{selectedApp.jobTitle || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Income</p>
                      <p className="font-medium text-gray-900">
                        ${selectedApp.monthlyIncome?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Employment Duration</p>
                      <p className="font-medium text-gray-900">{selectedApp.employmentDuration || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Previous Landlord & References */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">References</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Previous Landlord Name</p>
                      <p className="font-medium text-gray-900">{selectedApp.landlordName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Landlord Contact</p>
                      <p className="font-medium text-gray-900">{selectedApp.landlordContact || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Name</p>
                      <p className="font-medium text-gray-900">{selectedApp.referenceName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Contact</p>
                      <p className="font-medium text-gray-900">{selectedApp.referenceContact || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Reason for Moving</p>
                      <p className="font-medium text-gray-900">{selectedApp.reasonForMoving || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                        selectedApp.status === "Approved" || selectedApp.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : selectedApp.status === "Rejected" || selectedApp.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedApp.status || "Pending"}
                    </span>
                    <span className="text-sm text-gray-600">
                      Submitted on {new Date(selectedApp.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      • Consent: {selectedApp.consent ? "Given" : "Not Given"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                {(selectedApp.status === "Pending" || selectedApp.status === "PENDING") && (
                  <>
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </>
                )}
                {(selectedApp.status === "Approved" || selectedApp.status === "APPROVED") && (
                  <button
                    onClick={() => proceedToLease(selectedApp)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Proceed to Lease Signing
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}