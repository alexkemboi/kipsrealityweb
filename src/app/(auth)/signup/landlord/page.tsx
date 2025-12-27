"use client";
import SignUpPageContent from "@/components/website/Signup/SignUpPageContent";
import Link from "next/link";

export default function LandlordSignupPage() {
  return (
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create your workspace</h1>
        <p className="text-sm text-gray-500 mt-1">Start managing your properties today.</p>
      </div>
      
      {/* The form handles its own success state UI internally */}
      <SignUpPageContent role="PROPERTY_MANAGER" />

      {/* Footer Link */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
            Have an invite code?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
             Use it here
            </Link>
        </p>
      </div>
    </div>
  );
}
