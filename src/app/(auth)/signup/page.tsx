"use client";

import Link from "next/link";
import { Building2, User } from "lucide-react"; // Make sure lucide-react is installed

export default function RoleSelectionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join RentFlow360</h1>
        <p className="text-gray-500">Choose how you want to use the platform.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Card A: Landlord */}
        <Link href="/signup/landlord" className="group relative block bg-white border border-gray-200 rounded-xl p-8 text-center transition-all hover:border-blue-600 hover:shadow-lg">
          <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
            <Building2 className="w-8 h-8 text-blue-600 group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">I manage properties</h3>
          <p className="text-sm text-gray-500">
            For landlords, property managers, and HOAs looking to streamline operations.
          </p>
        </Link>

        {/* Card B: Tenant */}
        <Link href="/signup/tenant" className="group relative block bg-white border border-gray-200 rounded-xl p-8 text-center transition-all hover:border-green-600 hover:shadow-lg">
          <div className="mx-auto bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
            <User className="w-8 h-8 text-green-600 group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">I am a tenant</h3>
          <p className="text-sm text-gray-500">
            Pay rent, view your lease, and submit maintenance requests.
          </p>
        </Link>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
