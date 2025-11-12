'use client';

import { Suspense } from "react";
import LoginPageContent from "@/components/website/Login/LoginPageContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
