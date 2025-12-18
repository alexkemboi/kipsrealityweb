"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 1. Import Router
import Link from "next/link"; // For the back button

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // 2. Initialize Router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Security Best Practice: We don't throw an error if the email doesn't exist.
      // We essentially just "fake" success to prevent email enumeration.

      toast.success("If an account exists, a reset link has been sent.");
      setEmail("");

      // 3. Logic Update: Redirect to Login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false); // Only stop loading on error (on success we redirect)
    }
    // Note: We removed 'finally { setIsLoading(false) }' because we want the 
    // button to stay disabled/loading while we redirect the user.
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md mt-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm">
          Enter your email address to receive a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? "Sending Link..." : "Send Reset Link"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}