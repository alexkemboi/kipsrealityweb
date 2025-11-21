//src/components/Dashboard/propertymanagerdash/tenants/Lease-Signing.tsx
//lease creation form with steps
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/* ✅ Define type for the fetched application */
interface ApplicationData {
  id: string;

  // ✅ Tenant Info
  fullName: string;
  email: string;
  phone: string;

  // ✅ Relations
  userId: string;
  propertyId: string;
  unitId: string;

  // ✅ Property Info
  property?: {
    id: string;
    name?: string;
    city?: string;
    address?: string;
  };

  // ✅ Unit Info
  unit?: {
    id: string;
    unitNumber?: string;
    bedrooms?: number;
    bathrooms?: number;
    rentAmount?: number;
  };

  // ✅ Other fields you may use later
  leaseType?: string;
  leaseDuration?: string;
  moveInDate?: string;
}


/* ✅ Define the Lease Form type */
interface LeaseForm {
  startDate: string;
  endDate: string;
  leaseTerm: string;

  rentAmount: number | string;
  securityDeposit: number | string;

  paymentDueDay: number;
  paymentFrequency: string;

  lateFeeFlat: number | string;
  lateFeeDaily: number | string;
  gracePeriodDays: number | string;

  tenantResponsibilities: string;
  landlordResponsibilities: string;

  tenantPaysElectric: boolean;
  tenantPaysWater: boolean;
  tenantPaysTrash: boolean;
  tenantPaysInternet: boolean;

  usageType: string;

  earlyTerminationFee: number | string;
  terminationNoticeDays: number | string;
}

export default function LeaseSigningPage() {
  const searchParams = useSearchParams();

  const applicationId = searchParams.get("applicationId");

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(1);

  /* ✅ Default Form Values */
  const [form, setForm] = useState<LeaseForm>({
    startDate: "",
    endDate: "",
    leaseTerm: "12 months",

    rentAmount: "",
    securityDeposit: "",

    paymentDueDay: 1,
    paymentFrequency: "MONTHLY",

    lateFeeFlat: "",
    lateFeeDaily: "",
    gracePeriodDays: "",

    tenantResponsibilities: "",
    landlordResponsibilities: "",

    tenantPaysElectric: true,
    tenantPaysWater: false,
    tenantPaysTrash: false,
    tenantPaysInternet: false,

    usageType: "Residential",

    earlyTerminationFee: "",
    terminationNoticeDays: 30,
  });

  /* ✅ Fetch the tenant application */
  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/tenant-application/${applicationId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch application");

        setApplication(data);

        // Pre-fill rent amount from the unit
        setForm((prev) => ({
          ...prev,
          rentAmount: data.unit?.rentAmount || "",
        }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (applicationId) fetchApplication();
  }, [applicationId]);

  /* ✅ Step Navigation */
  function nextStep() {
    if (step < 6) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  // In your LeaseSigningPage component (the form with steps)
async function createLease() {
  try {
    if (!application) throw new Error("Missing application data.");

    const res = await fetch("/api/lease", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        tenantId: application.userId ?? null,
        propertyId: application.propertyId,
        unitId: application.unitId,
        ...form,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to create lease");

    alert("Lease created successfully!");
    window.location.href = `/property-manager/content/lease/${data.id}/sign`;
  } catch (err: any) {
    alert(err.message);
  }
}

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="p-10 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lease Signing Wizard</h1>

      {/* ✅ Step progress bar */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div
            key={num}
            className={`flex-1 h-1 mx-1 rounded ${
              step >= num ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

      {/* ✅ Form Wrapper */}
      <div className="bg-white p-6 rounded-xl shadow space-y-6">

        {/* ✅ STEP 1 — Lease Basics */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Step 1: Lease Basics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div>
                <label>End Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <label>Lease Term</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={form.leaseTerm}
                  onChange={(e) => setForm({ ...form, leaseTerm: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ✅ STEP 2 — Payment Terms */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Step 2: Payment Terms</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Rent Amount</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={form.rentAmount}
                  onChange={(e) =>
                    setForm({ ...form, rentAmount: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label>Security Deposit</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={form.securityDeposit}
                  onChange={(e) =>
                    setForm({ ...form, securityDeposit: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label>Payment Due Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="w-full border p-2 rounded"
                  value={form.paymentDueDay}
                  onChange={(e) =>
                    setForm({ ...form, paymentDueDay: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label>Payment Frequency</label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.paymentFrequency}
                  onChange={(e) =>
                    setForm({ ...form, paymentFrequency: e.target.value })
                  }
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ✅ STEP 3 — Late Fees */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Step 3: Late Fees & Penalties</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Flat Late Fee</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={form.lateFeeFlat}
                  onChange={(e) =>
                    setForm({ ...form, lateFeeFlat: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label>Daily Late Fee</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={form.lateFeeDaily}
                  onChange={(e) =>
                    setForm({ ...form, lateFeeDaily: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label>Grace Period (days)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={form.gracePeriodDays}
                  onChange={(e) =>
                    setForm({ ...form, gracePeriodDays: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ✅ STEP 4 — Utilities */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Step 4: Utilities</h2>

            <div className="space-y-3">
              {[
                ["tenantPaysElectric", "Electricity"],
                ["tenantPaysWater", "Water"],
                ["tenantPaysTrash", "Trash"],
                ["tenantPaysInternet", "Internet"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form[key as keyof LeaseForm] as boolean}
                    onChange={() =>
                      setForm({
                        ...form,
                        [key]: !form[key as keyof LeaseForm],
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ✅ STEP 5 — Responsibilities */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Step 5: Responsibilities & Usage
            </h2>

            <textarea
              className="w-full border p-2 rounded mb-3"
              placeholder="Tenant Responsibilities"
              value={form.tenantResponsibilities}
              onChange={(e) =>
                setForm({ ...form, tenantResponsibilities: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 rounded mb-3"
              placeholder="Landlord Responsibilities"
              value={form.landlordResponsibilities}
              onChange={(e) =>
                setForm({ ...form, landlordResponsibilities: e.target.value })
              }
            />

            <label className="block mt-2">Usage Type</label>
            <select
              className="w-full border p-2 rounded"
              value={form.usageType}
              onChange={(e) => setForm({ ...form, usageType: e.target.value })}
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        )}

        {/* ✅ STEP 6 — FINAL REVIEW */}
{step === 6 && (
  <div>
    <h2 className="text-xl font-semibold mb-3">
      Step 6: Termination & Final Review
    </h2>

    {/* Termination Fields */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label>Early Termination Fee</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={form.earlyTerminationFee}
          onChange={(e) =>
            setForm({
              ...form,
              earlyTerminationFee: Number(e.target.value),
            })
          }
        />
      </div>

      <div>
        <label>Notice Period (days)</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={form.terminationNoticeDays}
          onChange={(e) =>
            setForm({
              ...form,
              terminationNoticeDays: Number(e.target.value),
            })
          }
        />
      </div>
    </div>

    {/* ✅ REVIEW SUMMARY */}
        <h3 className="text-lg font-semibold mb-3">Review Summary</h3>

        <div className="bg-gray-50 p-4 rounded border space-y-3">

        {/* ✅ Tenant Info */}
        <div>
            <p className="font-semibold text-gray-700">Tenant Information</p>
            <p>Name: {application?.fullName}</p>
            <p>Email: {application?.email}</p>
            <p>Phone: {application?.phone}</p>
        </div>

        {/* ✅ Property Info */}
        <div>
            <p className="font-semibold text-gray-700">Property Information</p>
            <p>
            Property: {application?.property?.name || application?.property?.city}
            </p>
        </div>

        {/* ✅ Unit Info */}
        <div>
            <p className="font-semibold text-gray-700">Unit Information</p>
            <p>Unit Number: {application?.unit?.unitNumber}</p>
            <p>Bedrooms/Bathrooms: {application?.unit?.bedrooms} bed / {application?.unit?.bathrooms} bath</p>
            <p>Monthly Rent: ${form.rentAmount}</p>
        </div>

        {/* ✅ Lease Basics */}
        <div>
            <p className="font-semibold text-gray-700">Lease Term</p>
            <p>
            {form.startDate} → {form.endDate} ({form.leaseTerm})
            </p>
        </div>

        {/* ✅ Payment Terms */}
        <div>
            <p className="font-semibold text-gray-700">Payment Terms</p>
            <p>Rent Amount: ${form.rentAmount}</p>
            <p>Deposit: ${form.securityDeposit || "0"}</p>
            <p>Payment Due Day: {form.paymentDueDay}</p>
            <p>Payment Frequency: {form.paymentFrequency}</p>
        </div>

        {/* ✅ Late Fees */}
        <div>
            <p className="font-semibold text-gray-700">Late Fees & Penalties</p>
            <p>Flat Late Fee: ${form.lateFeeFlat || "0"}</p>
            <p>Daily Late Fee: ${form.lateFeeDaily || "0"}</p>
            <p>Grace Period: {form.gracePeriodDays || 0} days</p>
        </div>

        {/* ✅ Utilities */}
        <div>
            <p className="font-semibold text-gray-700">Utilities Tenant Pays</p>
            <p>
            {[
                form.tenantPaysElectric && "Electricity",
                form.tenantPaysWater && "Water",
                form.tenantPaysTrash && "Trash",
                form.tenantPaysInternet && "Internet",
            ]
                .filter(Boolean)
                .join(", ") || "None"}
            </p>
        </div>

        {/* ✅ Usage */}
        <div>
            <p className="font-semibold text-gray-700">Usage Type</p>
            <p>{form.usageType}</p>
        </div>

        {/* ✅ Termination */}
        <div>
            <p className="font-semibold text-gray-700">Termination Rules</p>
            <p>Early Termination Fee: ${form.earlyTerminationFee || "0"}</p>
            <p>Notice Period: {form.terminationNoticeDays} days</p>
        </div>

        </div>

        {/* ✅ Create Lease Button */}
        <button
        onClick={createLease}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
        Create Lease
        </button>
    </div>
    )}


        {/* ✅ Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Back
            </button>
          ) : (
            <span></span>
          )}

          {step < 6 && (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
