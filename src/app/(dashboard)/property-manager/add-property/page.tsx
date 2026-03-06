import { Suspense } from "react";
import PropertyForm from "@/components/website/PropertyManager/RegisterPropertyForm";

function PropertyFormFallback() {
  return (
    <div
      className="min-h-[300px] flex items-center justify-center p-6 text-gray-500"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
        <span>Loading form...</span>
      </div>
    </div>
  );
}

export default function AddProperty() {
  return (
    <Suspense fallback={<PropertyFormFallback />}>
      <PropertyForm />
    </Suspense>
  );
}
