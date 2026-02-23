import Link from "next/link";
import { Building2, User } from "lucide-react";

export default function RoleSelectionPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join RentFlow360</h1>
        <p className="text-gray-600">Choose how you want to use the platform.</p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        {/* Card A: Landlord */}
        <Link
          href="/signup/landlord"
          className="group relative block rounded-xl border border-gray-200 bg-white p-8 text-center transition-all hover:border-blue-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Sign up as a landlord or property manager"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 transition-colors group-hover:bg-blue-600 group-focus-visible:bg-blue-600">
            <Building2
              className="h-8 w-8 text-blue-600 group-hover:text-white group-focus-visible:text-white"
              aria-hidden="true"
            />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">I manage properties</h2>
          <p className="text-sm text-gray-600">
            For landlords, property managers, and HOAs looking to streamline operations.
          </p>
        </Link>

        {/* Card B: Tenant */}
        <Link
          href="/signup/tenant"
          className="group relative block rounded-xl border border-gray-200 bg-white p-8 text-center transition-all hover:border-green-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          aria-label="Sign up as a tenant"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 transition-colors group-hover:bg-green-600 group-focus-visible:bg-green-600">
            <User
              className="h-8 w-8 text-green-600 group-hover:text-white group-focus-visible:text-white"
              aria-hidden="true"
            />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">I am a tenant</h2>
          <p className="text-sm text-gray-600">
            Pay rent, view your lease, and submit maintenance requests.
          </p>
        </Link>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
