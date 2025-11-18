"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Star, Calendar, Briefcase, Clock, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Vendor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName: string;
  serviceType: string;
  rating?: number;
  tasksInQueue?: number;
  specialty?: string;
  availability?: string;
  accepted: boolean;
  createdAt: string;
}

type Request = {
  id: String,
  title: String,
  status: String,
}
export default function VendorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  const { user } = useAuth();
  const organizationId = user?.organization?.id;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [openRequests, setOpenRequests] = useState<Request[]>([]);
  
  // Fetch vendor details
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/auth/invites/vendor/${vendorId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch vendor details");
        }

        const data = await res.json();
        setVendor(data.vendor || null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load vendor details";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  useEffect( ()=> {
    async function fetchRequests() {
      if (!organizationId) { setLoading(false); return; }
      try {
        // fetch only open and unassigned requests for this organization
        const res = await fetch(`/api/maintenance?organizationId=${organizationId}&status=OPEN&unassigned=true`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setOpenRequests(data);
      } catch (error) { console.error("Error fetching maintenance requests:", error); }
      finally { setLoading(false); }
    }
    fetchRequests();
  }, [organizationId]);
  

  const handleAssignRequest = async () => {
    if (!selectedRequest.trim()) {
      toast.error("Please select a maintenance request");
      return;
    }

    try {
      setAssignLoading(true);
      // vendor.vendorRecordId is the actual Vendor.id in the Vendor table (ensure the vendor has a vendor record)
      const actualVendorId = (vendor as any).vendorRecordId;
      if (!actualVendorId) {
        console.warn("Vendor details:", vendor);
        const errorMsg = vendor?.accepted
          ? "Vendor record not found in database. Please ensure the vendor has completed registration."
          : "Vendor has not yet accepted the invitation. They must register first before you can assign requests.";
        throw new Error(errorMsg);
      }

      const res = await fetch(`/api/maintenance/${selectedRequest}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: actualVendorId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        const errMsg = json?.error || json?.message || "Failed to assign request to vendor";
        throw new Error(errMsg);
      }

      toast.success("Request assigned successfully!");
      // remove the assigned request from the local list so it no longer appears
      setOpenRequests((prev) => prev.filter((r) => r.id !== selectedRequest));
      setShowAssignModal(false);
      setSelectedRequest("");
      // Redirect to the requests page
      router.push("/property-manager/maintenance/requests");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to assign request";
      toast.error(errorMsg);
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white flex justify-center items-center min-h-screen">
        <div className="text-gray-700"> Loading vendor details...</div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen p-6 bg-white">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-4 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error || "Vendor not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        Go Back
      </button>

      {/* Vendor Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Vendor Info */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {vendor.firstName} {vendor.lastName}
                </h1>
                <p className="text-gray-600 text-lg mb-4">{vendor.companyName}</p>
              </div>
              {vendor.accepted && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={18} />
                  <span className="font-medium">Verified</span>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Email</p>
                  <p className="text-gray-900 font-medium">{vendor.email}</p>
                </div>
                {vendor.phone && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Phone</p>
                    <p className="text-gray-900 font-medium">{vendor.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 text-sm mb-1">Service Type</p>
                  <p className="text-gray-900 font-medium">{vendor.serviceType}</p>
                </div>
              </div>
            </div>

            {/* Specialty */}
            {vendor.specialty && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase size={20} className="text-emerald-500" />
                  Specialty
                </h3>
                <p className="text-gray-700">{vendor.specialty}</p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            {/* Rating */}
            {vendor.rating !== undefined && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={20} className="text-yellow-400" />
                  <span className="text-gray-600 text-sm">Rating</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{vendor.rating.toFixed(1)}</p>
                  <p className="text-gray-600 text-sm">/5.0</p>
                </div>
              </div>
            )}

            {/* Tasks in Queue */}
            {vendor.tasksInQueue !== undefined && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={20} className="text-emerald-500" />
                  <span className="text-gray-600 text-sm">Tasks in Queue</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{vendor.tasksInQueue}</p>
              </div>
            )}

            {/* Availability */}
            {vendor.availability && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={20} className="text-emerald-500" />
                  <span className="text-gray-600 text-sm">Availability</span>
                </div>
                <p className="text-gray-900 font-medium">{vendor.availability}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {vendor.accepted ? (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            Assign a Request
          </button>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          ⚠️ This vendor has not yet accepted the invitation. They must register first before you can assign maintenance requests.
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg w-full max-w-lg shadow-xl p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Assign Maintenance Request</h3>
              <p className="text-gray-600 text-sm mt-2">
                Select a maintenance request to assign to {vendor.firstName}
              </p>
            </div>

            <div className="space-y-4 mb-6">

              <label className="block">
                <span className="text-gray-700 text-sm font-medium mb-2 block">
                  Select Request <span className="text-red-500">*</span>
                </span>
                <label className="block mb-2 text-gray-900">Select a request:</label>
                <select
                  value={selectedRequest}
                  onChange={(e) => setSelectedRequest(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                >
                  <option value="">Choose a request...</option>
                  {openRequests.map((request) => (
                    <option key={request.id.toString()} value={request.id.toString()}>
                      {request.title || "Untitled Request"}
                    </option>
                  ))}
                </select>

              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRequest}
                disabled={assignLoading}
                className="flex-1 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
              >
                {assignLoading ? "Assigning..." : "Assign Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
