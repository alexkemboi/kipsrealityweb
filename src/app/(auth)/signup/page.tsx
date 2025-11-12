'use client';

import { Suspense } from "react";
import SignUpPageContent from "@/components/website/Signup/SignUpPageContent";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading signup...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}
