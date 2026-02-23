import { Suspense } from "react";
import LoginPageContent from "@/components/website/Login/LoginPageContent";

function LoginFallback() {
  return (
    <div
      className="min-h-[300px] flex items-center justify-center p-6 text-center"
      role="status"
      aria-live="polite"
    >
      Loading login...
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
