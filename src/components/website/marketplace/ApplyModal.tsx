"use client";

import React, { ChangeEvent, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, User, Briefcase, Home, FileCheck, X, AlertCircle } from "lucide-react";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  listing: {
    id: string;
    title: string;
    description?: string;
    price: number;
    unitId?: string | null;
    propertyId?: string | null;
    unit?: { id: string; unitNumber?: string; property?: { id: string; name?: string } } | null;
    property?: { id: string; name?: string } | null;
  } | null;
}

interface TenantFormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  ssn: string;
  address: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: string;
  employmentDuration: string;
  leaseType: string;
  occupancyType: string;
  moveInDate: string;
  leaseDuration: string;
  occupants: string;
  pets: string;
  landlordName: string;
  landlordContact: string;
  reasonForMoving: string;
  referenceName: string;
  referenceContact: string;
  consent: boolean;
}

export default function ApplyModal({ open, onClose, onSubmit, listing }: ApplyModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TenantFormData>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    ssn: "",
    address: "",
    employerName: "",
    jobTitle: "",
    monthlyIncome: "",
    employmentDuration: "",
    leaseType: "",
    occupancyType: "",
    moveInDate: "",
    leaseDuration: "",
    occupants: "",
    pets: "",
    landlordName: "",
    landlordContact: "",
    reasonForMoving: "",
    referenceName: "",
    referenceContact: "",
    consent: false,
  });

  if (!open || !listing) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.dob;
      case 2:
        return formData.employerName && formData.jobTitle && formData.monthlyIncome;
      case 3:
        return formData.leaseType && formData.occupancyType && formData.moveInDate && formData.leaseDuration;
      case 4:
        return formData.consent;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.consent) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        unitId: listing.unit?.id || listing.unitId || null,
        propertyId: listing.unit?.property?.id || listing.property?.id || null,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
        occupants: formData.occupants ? Number(formData.occupants) : null,
      };

      console.log("Submitting payload:", payload);

      const res = await fetch("/api/tenant-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit application");

      onSubmit(result);
      alert("Your tenant application has been submitted successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 4) * 100;

  const stepIcons = [
    { icon: User, label: "Personal Info" },
    { icon: Briefcase, label: "Employment" },
    { icon: Home, label: "Lease Details" },
    { icon: FileCheck, label: "References" },
  ];

  const InputField = ({ name, placeholder, type = "text", value, required = false }: any) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {placeholder} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );

  const SelectField = ({ name, placeholder, value, options, required = false }: any) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {placeholder} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleSelectChange}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
      >
        <option value="">Select {placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Compact Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Tenant Application</h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <Home className="w-4 h-4" />
                <span>
                  Unit {listing.unit?.unitNumber || "N/A"} • {listing.unit?.property?.name || listing.property?.name || "Property"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">KES {listing.price.toLocaleString()}</p>
              <p className="text-xs text-blue-200">per month</p>
            </div>
          </div>

          {/* Compact Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="relative h-1.5 bg-blue-900/40 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-blue-100 font-medium whitespace-nowrap">Step {step}/4</span>
          </div>

          {/* Compact Step Icons */}
          <div className="flex justify-between mt-4 gap-2">
            {stepIcons.map((item, idx) => {
              const stepNum = idx + 1;
              const Icon = item.icon;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={stepNum} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                        ? "bg-white text-blue-600 ring-2 ring-white/50"
                        : "bg-blue-800/50 text-blue-300"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-white" : "text-blue-200"}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto max-h-[75vh] relative">
          <div className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600">Please provide your basic details to begin your application</p>
                </div>
                <InputField name="fullName" placeholder="Full Legal Name" value={formData.fullName} required />
                <InputField name="email" type="email" placeholder="Email Address" value={formData.email} required />
                <InputField name="phone" type="tel" placeholder="Phone Number" value={formData.phone} required />
                <InputField name="dob" type="date" placeholder="Date of Birth" value={formData.dob} required />
                <InputField name="ssn" placeholder="National ID / Passport Number" value={formData.ssn} />
                <InputField name="address" placeholder="Current Address" value={formData.address} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Employment Details</h3>
                  <p className="text-gray-600">Tell us about your current employment situation</p>
                </div>
                <InputField name="employerName" placeholder="Employer Name" value={formData.employerName} required />
                <InputField name="jobTitle" placeholder="Job Title / Position" value={formData.jobTitle} required />
                <InputField name="monthlyIncome" type="number" placeholder="Monthly Income (KES)" value={formData.monthlyIncome} required />
                <InputField name="employmentDuration" placeholder="Employment Duration (e.g., 2 years)" value={formData.employmentDuration} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Lease Information</h3>
                  <p className="text-gray-600">Specify your lease preferences and move-in details</p>
                </div>
                <SelectField
                  name="leaseType"
                  placeholder="Lease Type"
                  value={formData.leaseType}
                  options={[
                    { value: "long-term", label: "Long Term (12+ months)" },
                    { value: "short-term", label: "Short Term (1-11 months)" },
                  ]}
                  required
                />
                <SelectField
                  name="occupancyType"
                  placeholder="Occupancy Type"
                  value={formData.occupancyType}
                  options={[
                    { value: "single", label: "Single Occupant" },
                    { value: "family", label: "Family" },
                    { value: "shared", label: "Shared" },
                  ]}
                  required
                />
                <InputField name="moveInDate" type="date" placeholder="Preferred Move-in Date" value={formData.moveInDate} required />
                <InputField name="leaseDuration" type="number" placeholder="Lease Duration (months)" value={formData.leaseDuration} required />
                <InputField name="occupants" type="number" placeholder="Number of Occupants" value={formData.occupants} />
                <InputField name="pets" placeholder="Pets (if any)" value={formData.pets} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">References & Previous Landlord</h3>
                  <p className="text-gray-600">Provide references to support your application</p>
                </div>
                <InputField name="landlordName" placeholder="Previous Landlord Name" value={formData.landlordName} />
                <InputField name="landlordContact" placeholder="Previous Landlord Contact" value={formData.landlordContact} />
                <InputField name="reasonForMoving" placeholder="Reason for Moving" value={formData.reasonForMoving} />
                <InputField name="referenceName" placeholder="Reference Name" value={formData.referenceName} />
                <InputField name="referenceContact" placeholder="Reference Contact" value={formData.referenceContact} />

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleInputChange}
                      className="mt-1 w-6 h-6 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="text-sm text-gray-700 flex-1">
                      <p className="font-semibold text-base mb-2 text-gray-900">Declaration and Consent</p>
                      <p className="leading-relaxed">
                        I certify that all information provided in this application is accurate and complete. I authorize the verification of this information and consent to a background check, credit check, and reference verification as part of the rental application process.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all ${
                step === 1
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              Back
            </button>
            <div className="flex gap-3">
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    isStepValid()
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.consent}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    formData.consent && !loading
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}