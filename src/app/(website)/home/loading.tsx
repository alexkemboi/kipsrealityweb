import { Loader2 } from "lucide-react";

export default function HomeLoading() {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-500 font-medium">Loading...</p>
    </div>
  );
}