import { useEffect, useState } from "react";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { theme } from "../../ui/theme";
import { Check, X, NotebookPen } from "lucide-react";

// Dummy type for request, replace with your actual type
interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  property?: {
    name?: string;
    address?: string;
    city?: string;
  };
  unit?: {
    unitNumber?: string;
    unitName?: string;
  };
  requestedBy?: {
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
  amount?: number;
}

export default function VendorDashboard() {
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [chargeAmount, setChargeAmount] = useState<string>("");
    const [modalLoading, setModalLoading] = useState(false);
  const { user } = useAuth();
  const organizationId = user?.organization?.id;
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string>("");

  // Fetch Vendor record by userId
  useEffect(() => {
    async function fetchVendor() {
      if (!user?.id || !organizationId) return;
      try {
        const res = await fetch(`/api/vendor?userId=${user.id}&organizationId=${organizationId}`);
        if (!res.ok) throw new Error("Failed to fetch vendor");
        const vendor = await res.json();
        setVendorId(vendor.id);
      } catch (err) {
        setVendorId("");
      }
    }
    fetchVendor();
  }, [user?.id, organizationId]);

  // Fetch requests assigned to this vendor
  useEffect(() => {
    async function fetchRequests() {
      if (!vendorId || !organizationId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/maintenance?organizationId=${organizationId}&vendorId=${vendorId}`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [vendorId, organizationId]);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>
        Vendor Dashboard
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-600">No requests assigned to you.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 bg-white">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Title</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700">Property</th>
                <th className="p-4 font-semibold text-gray-700">Unit</th>
                <th className="p-4 font-semibold text-gray-700">Requested By</th>
                <th className="p-4 font-semibold text-gray-700">Cost</th>
                <th className="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">
                    <p className="font-medium text-gray-900">{req.title}</p>
                  </td>

                  <td className="p-2">
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-600">
                      {req.status}
                    </span>
                  </td>

                  <td className="p-2 text-gray-700">
                    {req.property?.name}
                    <br />
                    <span className="text-sm text-gray-500">
                      {req.property?.address}, {req.property?.city}
                    </span>
                  </td>

                  <td className="p-2 text-gray-700">
                    {req.unit?.unitNumber} {req.unit?.unitName}
                  </td>

                  <td className="p-2 text-gray-700">
                    {req.requestedBy?.user?.firstName} {req.requestedBy?.user?.lastName}
                    <br />
                    <span className="text-sm text-gray-500">
                      {req.requestedBy?.user?.email}
                    </span>
                  </td>

                  <td className="p-2 text-gray-700">{req.amount ? `$${req.amount}` : "-"}</td>

                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <button
                        className={`p-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition ${req.status !== "OPEN" ? "opacity-50 cursor-not-allowed" : ""}`}
                        title="Accept"
                        disabled={req.status !== "OPEN"}
                        onClick={() => {
                          setSelectedRequest(req);
                          setChargeAmount("");
                          setShowModal(true);
                        }}
                      >
                        <Check size={18} />
                      </button>

                      <button
                        className="p-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>

                      <button
                        className="p-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
                        title="Edit"
                      >
                        <NotebookPen size={18} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Accepting Request */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primary }}>
              Accept Maintenance Request
            </h2>
            <div className="mb-4">
              <div className="mb-2"><strong>Title:</strong> {selectedRequest.title}</div>
              <div className="mb-2"><strong>Description:</strong> {selectedRequest.description}</div>
              <div className="mb-2"><strong>Status:</strong> {selectedRequest.status}</div>
              <div className="mb-2"><strong>Property:</strong> {selectedRequest.property?.name} ({selectedRequest.property?.address}, {selectedRequest.property?.city})</div>
              <div className="mb-2"><strong>Unit:</strong> {selectedRequest.unit?.unitNumber} {selectedRequest.unit?.unitName}</div>
              <div className="mb-2"><strong>Requested By:</strong> {selectedRequest.requestedBy?.user?.firstName} {selectedRequest.requestedBy?.user?.lastName} ({selectedRequest.requestedBy?.user?.email})</div>
            </div>
            <div className="mb-6">
              <label className="block font-semibold mb-2">How much will you charge for this?</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter amount (e.g. 1000)"
                value={chargeAmount}
                onChange={e => setChargeAmount(e.target.value)}
                min={0}
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                disabled={modalLoading || !chargeAmount}
                onClick={async () => {
                  setModalLoading(true);
                  try {
                    const res = await fetch(`/api/maintenance/${selectedRequest.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "IN_PROGRESS", amount: Number(chargeAmount) })
                    });
                    if (!res.ok) throw new Error("Failed to update request");
                    setShowModal(false);
                    setSelectedRequest(null);
                    setChargeAmount("");
                    // Refresh requests
                    const reqRes = await fetch(`/api/maintenance?organizationId=${organizationId}&vendorId=${vendorId}`);
                    const reqData = await reqRes.json();
                    setRequests(reqData);
                  } catch (err) {
                    alert("Failed to update request");
                  } finally {
                    setModalLoading(false);
                  }
                }}
              >
                {modalLoading ? "Saving..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
