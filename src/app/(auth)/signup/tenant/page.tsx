import SignUpPageContent from "@/components/website/Signup/SignUpPageContent";
import Link from "next/link";

export default function TenantSignupPage() {
  return (
    <div className="max-w-md w-full mx-auto p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* The form handles its own success state UI internally */}
      <SignUpPageContent role="TENANT" />

      {/* Footer Link */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Have an invite code?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
          >
            Use it here
          </Link>
        </p>
      </div>
    </div>
  );
}
