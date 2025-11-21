// app/property-manager/content/lease/[id]/renew/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, DollarSign, FileText, RefreshCw, Send } from "lucide-react";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  leaseTerm: string;
  tenant?: { fullName: string; email: string };
  application?: { fullName: string; email: string };
  property: { name: string };
  unit: { unitNumber: string };
  renewalHistory: Array<{
    id: string;
    oldEndDate: string;
    newEndDate: string;
    oldRentAmount: number;
    newRentAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function LeaseRenewalPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [renewalForm, setRenewalForm] = useState({
    renewalType: "MANUAL",
    newTermMonths: 12,
    newEndDate: "",
    rentIncrease: 0,
    rentIncreaseType: "PERCENTAGE", // PERCENTAGE or FIXED
    newRentAmount: 0,
    negotiationNotes: "",
  });

  useEffect(() => {
    fetchLease();
  }, [id]);

  async function fetchLease() {
    try {
      const res = await fetch(`/api/lease/${id}`);
      const data = await res.json();
      if (res.ok) {
        setLease(data);
        
        // Calculate default new end date
        const currentEnd = new Date(data.endDate);
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + 12);
        
        setRenewalForm({
          ...renewalForm,
          newEndDate: newEnd.toISOString().split("T")[0],
          newRentAmount: data.rentAmount,
        });
      }
    } catch (error) {
      console.error("Failed to fetch lease:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (lease) {
      let newRent = lease.rentAmount;
      
      if (renewalForm.rentIncreaseType === "PERCENTAGE") {
        newRent = lease.rentAmount * (1 + renewalForm.rentIncrease / 100);
      } else {
        newRent = lease.rentAmount + renewalForm.rentIncrease;
      }
      
      setRenewalForm((prev) => ({ ...prev, newRentAmount: newRent }));
    }
  }, [renewalForm.rentIncrease, renewalForm.rentIncreaseType]);

  async function handleSubmitRenewal() {
    if (!lease) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lease/${lease.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(renewalForm),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Renewal offer sent to tenant!");
        router.push(`/property-manager/content/lease/${lease.id}`);
      } else {
        alert(data.error || "Failed to initiate renewal");
      }
    } catch (error) {
      console.error("Renewal error:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lease...</p>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Lease not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600" />
          Lease Renewal
        </h1>
        <p className="text-gray-600 mt-2">
          Create a renewal offer for {lease.tenant?.fullName || lease.application?.fullName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Lease Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Current Lease Details
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Property</p>
              <p className="font-semibold">{lease.property.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Unit</p>
              <p className="font-semibold">{lease.unit.unitNumber}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Current Term</p>
              <p className="font-semibold">
                {new Date(lease.startDate).toLocaleDateString()} -{" "}
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Current Rent</p>
              <p className="text-2xl font-bold text-blue-600">
                ${lease.rentAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tenant</p>
              <p className="font-semibold">
                {lease.tenant?.fullName || lease.application?.fullName}
              </p>
              <p className="text-sm text-gray-500">
                {lease.tenant?.email || lease.application?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Renewal Form */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Renewal Terms
          </h2>

          <div className="space-y-4">
            {/* Renewal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renewal Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={renewalForm.renewalType}
                onChange={(e) =>
                  setRenewalForm({ ...renewalForm, renewalType: e.target.value })
                }
              >
                <option value="MANUAL">Manual</option>
                <option value="AUTO">Automatic</option>
                <option value="RENEGOTIATED">Renegotiated</option>
              </select>
            </div>

            {/* New Term Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Term (months)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={renewalForm.newTermMonths}
                onChange={(e) => {
                  const months = parseInt(e.target.value);
                  const currentEnd = new Date(lease.endDate);
                  const newEnd = new Date(currentEnd);
                  newEnd.setMonth(newEnd.getMonth() + months);
                  
                  setRenewalForm({
                    ...renewalForm,
                    newTermMonths: months,
                    newEndDate: newEnd.toISOString().split("T")[0],
                  });
                }}
              />
            </div>

            {/* New End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New End Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={renewalForm.newEndDate}
                onChange={(e) =>
                  setRenewalForm({ ...renewalForm, newEndDate: e.target.value })
                }
              />
            </div>

            {/* Rent Increase Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Adjustment Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={renewalForm.rentIncreaseType}
                onChange={(e) =>
                  setRenewalForm({
                    ...renewalForm,
                    rentIncreaseType: e.target.value,
                  })
                }
              >
                <option value="PERCENTAGE">Percentage Increase</option>
                <option value="FIXED">Fixed Amount Increase</option>
              </select>
            </div>

            {/* Rent Increase Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Increase{" "}
                {renewalForm.rentIncreaseType === "PERCENTAGE" ? "(%)" : "($)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={renewalForm.rentIncrease}
                onChange={(e) =>
                  setRenewalForm({
                    ...renewalForm,
                    rentIncrease: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            {/* New Rent Amount (Calculated) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-1">New Monthly Rent</p>
              <p className="text-3xl font-bold text-blue-600">
                ${renewalForm.newRentAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Increase of $
                {(renewalForm.newRentAmount - lease.rentAmount).toLocaleString()}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Additional terms or notes for this renewal..."
                value={renewalForm.negotiationNotes}
                onChange={(e) =>
                  setRenewalForm({
                    ...renewalForm,
                    negotiationNotes: e.target.value,
                  })
                }
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitRenewal}
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Send className="w-5 h-5" />
              {submitting ? "Sending..." : "Send Renewal Offer"}
            </button>
          </div>
        </div>
      </div>

      {/* Renewal History */}
      {lease.renewalHistory && lease.renewalHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Renewal History</h2>
          <div className="space-y-3">
            {lease.renewalHistory.map((renewal) => (
              <div
                key={renewal.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(renewal.oldEndDate).toLocaleDateString()} →{" "}
                      {new Date(renewal.newEndDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Rent: ${renewal.oldRentAmount} → ${renewal.newRentAmount}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      renewal.status === "EXECUTED"
                        ? "bg-green-100 text-green-800"
                        : renewal.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {renewal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Back to Lease
        </button>
      </div>
    </div>
  );
}