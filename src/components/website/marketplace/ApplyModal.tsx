"use client";

import React, { ChangeEvent, useState, useCallback, memo } from "react";
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

//input component to prevent re-renders
const InputField = memo(({ name, placeholder, type = "text", value, onChange, required = false }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {placeholder} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete="off"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
  </div>
));

InputField.displayName = 'InputField';

// select component
const SelectField = memo(({ name, placeholder, value, options, onChange, required = false }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {placeholder} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
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
));

SelectField.displayName = 'SelectField';

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

  // Input Change Handler
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Select Change Handler
  const handleSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const nextStep = useCallback(() => setStep((prev) => Math.min(prev + 1, 4)), []);
  const prevStep = useCallback(() => setStep((prev) => Math.max(prev - 1, 1)), []);

  const isStepValid = useCallback(() => {
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
  }, [step, formData]);

  const handleSubmit = useCallback(async () => {
    if (!formData.consent) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        unitId: listing?.unit?.id || listing?.unitId || null,
        propertyId: listing?.unit?.property?.id || listing?.property?.id || null,
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
  }, [formData, listing, onSubmit, onClose]);

  if (!open || !listing) return null;

  const progress = (step / 4) * 100;

  const stepIcons = [
    { icon: User, label: "Personal Info" },
    { icon: Briefcase, label: "Employment" },
    { icon: Home, label: "Lease Details" },
    { icon: FileCheck, label: "References" },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-blue-700 text-white px-6 py-5">
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
              <p className="text-xl font-bold">USD {listing.price.toLocaleString()}</p>
              <p className="text-xs text-blue-200">per month</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="relative h-1.5 bg-blue-900/40 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-blue-100 font-medium whitespace-nowrap">Step {step}/4</span>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4 gap-2">
            {stepIcons.map((item, idx) => {
              const stepNum = idx + 1;
              const Icon = item.icon;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={stepNum} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isCompleted
                      ? "bg-blue-500"
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

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[75vh] relative">
          <div className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600">Please provide your basic details to begin your application</p>
                </div>
                <InputField name="fullName" placeholder="Full Legal Name" value={formData.fullName} onChange={handleInputChange} required />
                <InputField name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
                <InputField name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required />
                <InputField name="dob" type="date" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} required />
                <InputField name="ssn" placeholder="National ID / Passport Number" value={formData.ssn} onChange={handleInputChange} />
                <InputField name="address" placeholder="Current Address" value={formData.address} onChange={handleInputChange} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Employment Details</h3>
                  <p className="text-gray-600">Tell us about your current employment situation</p>
                </div>
                <InputField name="employerName" placeholder="Employer Name" value={formData.employerName} onChange={handleInputChange} required />
                <InputField name="jobTitle" placeholder="Job Title / Position" value={formData.jobTitle} onChange={handleInputChange} required />
                <InputField name="monthlyIncome" type="number" placeholder="Monthly Income " value={formData.monthlyIncome} onChange={handleInputChange} required />
                <InputField name="employmentDuration" placeholder="Employment Duration (e.g., 2 years)" value={formData.employmentDuration} onChange={handleInputChange} />
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
                  onChange={handleSelectChange}
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
                  onChange={handleSelectChange}
                  options={[
                    { value: "single", label: "Single Occupant" },
                    { value: "family", label: "Family" },
                    { value: "shared", label: "Shared" },
                  ]}
                  required
                />
                <InputField name="moveInDate" type="date" placeholder="Preferred Move-in Date" value={formData.moveInDate} onChange={handleInputChange} required />
                <InputField name="leaseDuration" type="number" placeholder="Lease Duration (months)" value={formData.leaseDuration} onChange={handleInputChange} required />
                <InputField name="occupants" type="number" placeholder="Number of Occupants" value={formData.occupants} onChange={handleInputChange} />
                <InputField name="pets" placeholder="Pets (if any)" value={formData.pets} onChange={handleInputChange} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">References & Previous Landlord</h3>
                  <p className="text-gray-600">Provide references to support your application</p>
                </div>
                <InputField name="landlordName" placeholder="Previous Landlord Name" value={formData.landlordName} onChange={handleInputChange} />
                <InputField name="landlordContact" placeholder="Previous Landlord Contact" value={formData.landlordContact} onChange={handleInputChange} />
                <InputField name="reasonForMoving" placeholder="Reason for Moving" value={formData.reasonForMoving} onChange={handleInputChange} />
                <InputField name="referenceName" placeholder="Reference Name" value={formData.referenceName} onChange={handleInputChange} />
                <InputField name="referenceContact" placeholder="Reference Contact" value={formData.referenceContact} onChange={handleInputChange} />

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
              className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all ${step === 1
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
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${isStepValid()
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.consent}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${formData.consent && !loading
                    ? "bg-blue-700 text-white hover:bg-blue-800 shadow-lg shadow-blue-500/20"
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