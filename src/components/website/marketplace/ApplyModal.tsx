import React, { ChangeEvent, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, User, Briefcase, Home, FileCheck } from "lucide-react";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TenantFormData) => void;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
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

export default function ApplyModal({ open, onClose, onSubmit, property }: ApplyModalProps) {
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

  if (!open) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
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
        return formData.leaseType && formData.occupancyType && formData.moveInDate;
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
      const res = await fetch("/api/tenant-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          propertyId: property.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit application");
      }

      const result = await res.json();
      onSubmit(result);
      alert("Your tenant application has been submitted successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 4) * 100;

  const stepIcons = [
    { icon: User, label: "Personal" },
    { icon: Briefcase, label: "Employment" },
    { icon: Home, label: "Lease" },
    { icon: FileCheck, label: "References" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tenant Application</h2>
              <p className="text-sm text-gray-600 mt-1">Step {step} of 4</p>
              <p className="text-xs mt-1 text-gray-500">
                Applying for: <strong>{property.title}</strong> — {property.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded-full"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Icons */}
          <div className="flex justify-between mt-4">
            {stepIcons.map((item, idx) => {
              const stepNum = idx + 1;
              const Icon = item.icon;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={stepNum} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    } hidden sm:block`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form */}
        <ScrollArea className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-5">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Personal Details</h3>
                <p className="text-sm text-gray-500">Tell us about yourself</p>

                {[
                  { name: "fullName", label: "Full Name", type: "text", required: true },
                  { name: "email", label: "Email", type: "email", required: true },
                  { name: "phone", label: "Phone Number", type: "tel", required: true },
                  { name: "dob", label: "Date of Birth", type: "date", required: true },
                  { name: "ssn", label: "SSN (optional)", type: "text" },
                  { name: "address", label: "Current Address", type: "text", required: true },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      onChange={handleInputChange}
                      value={(formData as any)[field.name]}
                      className="border border-gray-300 w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Employment & Income */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Employment & Income</h3>
                <p className="text-sm text-gray-500">Provide details about your job</p>

                {[
                  { name: "employerName", label: "Employer Name", type: "text" },
                  { name: "jobTitle", label: "Job Title", type: "text" },
                  { name: "monthlyIncome", label: "Monthly Income", type: "number" },
                  { name: "employmentDuration", label: "Employment Duration", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      onChange={handleInputChange}
                      value={(formData as any)[field.name]}
                      className="border border-gray-300 w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Proof of Income (optional)
                  </label>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Lease & Occupancy */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Lease & Occupancy Details</h3>
                <p className="text-sm text-gray-500">Select your preferred terms</p>

                <select
                  name="leaseType"
                  onChange={handleSelectChange}
                  value={formData.leaseType}
                  className="border border-gray-300 w-full px-4 py-2.5 rounded-lg"
                >
                  <option value="">Select Lease Type</option>
                  <option value="fixed-term">Fixed-term</option>
                  <option value="month-to-month">Month-to-Month</option>
                  <option value="short-term">Short-term</option>
                  <option value="sublease">Sublease</option>
                </select>

                <select
                  name="occupancyType"
                  onChange={handleSelectChange}
                  value={formData.occupancyType}
                  className="border border-gray-300 w-full px-4 py-2.5 rounded-lg"
                >
                  <option value="">Select Occupancy Type</option>
                  <option value="single">Single</option>
                  <option value="family">Family</option>
                  <option value="roommate">Roommate</option>
                  <option value="shared">Shared</option>
                </select>

                <input
                  name="moveInDate"
                  type="date"
                  onChange={handleInputChange}
                  value={formData.moveInDate}
                  placeholder="Move-in Date"
                  className="border border-gray-300 w-full px-4 py-2.5 rounded-lg"
                />

                <input
                  name="leaseDuration"
                  placeholder="Preferred Lease Duration (e.g., 12 months)"
                  onChange={handleInputChange}
                  value={formData.leaseDuration}
                  className="border border-gray-300 w-full px-4 py-2.5 rounded-lg"
                />

                <input
                  name="occupants"
                  placeholder="Number of Occupants"
                  onChange={handleInputChange}
                  value={formData.occupants}
                  className="border border-gray-300 w-full px-4 py-2.5 rounded-lg"
                />

                <input
                  name="pets"
                  placeholder="Pets (Yes/No, type if yes)"
                  onChange={handleInputChange}
                  value={formData.pets}
                  className="border border-gray-300 w-full px-4 py-2.5 rounded-lg"
                />
              </div>
            )}

            {/* Step 4: References & History */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">References & History</h3>
                <p className="text-sm text-gray-500">Provide background and references</p>

                {[
                  { name: "landlordName", label: "Previous Landlord Name" },
                  { name: "landlordContact", label: "Landlord Contact" },
                  { name: "reasonForMoving", label: "Reason for Moving" },
                  { name: "referenceName", label: "Reference Name" },
                  { name: "referenceContact", label: "Reference Contact" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type="text"
                      onChange={handleInputChange}
                      value={(formData as any)[field.name]}
                      className="border border-gray-300 w-full px-4 py-2.5 rounded-lg"
                    />
                  </div>
                ))}

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to allow background and credit screening and confirm my information is accurate.
                  </span>
                </label>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-between items-center">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 ml-auto">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-2.5 border rounded-lg font-medium ${
                step === 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-100 border-gray-300"
              }`}
            >
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`px-6 py-2.5 rounded-lg font-medium ${
                  isStepValid()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.consent}
                className={`px-6 py-2.5 rounded-lg font-medium ${
                  formData.consent
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}