import { Suspense } from "react";
import PropertyForm from "@/components/website/PropertyManager/RegisterPropertyForm";

function PropertyFormFallback() {
  return (
    <div
      className="min-h-[300px] flex items-center justify-center p-6 text-gray-500"
      role="status"
      aria-live="polite"
    >
      Loading form...
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
