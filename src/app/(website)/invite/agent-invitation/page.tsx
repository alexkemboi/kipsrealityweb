"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { useAgentInvite } from "@/hooks/useAgentInvite";

export default function AgentInviteDashboard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("ref");

  const {
    isClient,
    loading,
    accepting,
    status,
    inviteData,
    showPassword,
    showConfirmPassword,
    formData,
    errors,
    handleSubmit,
    handleInputChange,
    resetStatus,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = useAgentInvite(token ?? "");

  // Loading state
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
        <span className="ml-3 text-gray-700 font-medium">Loading invite...</span>
      </div>
    );
  }

  // Missing token
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Missing Invitation Token
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is incomplete. Please request a new invitation
            from your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Invalid invite state
  if (!inviteData?.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please contact your
            administrator for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  // (Your API should accept invite -> create agent -> send verification email)
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-blue-900 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation Accepted
          </h2>

          <p className="text-gray-600">
            Your account has been created successfully.
          </p>

          <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-left">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-900 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Verify your email
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  We sent a verification email to{" "}
                  <span className="font-semibold">{formData.email}</span>.  
                  Please open your inbox and click the verification link.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-5">
            If you don’t see it, check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't process your invitation at this time. Please try again
            or contact support.
          </p>
          <button
            onClick={resetStatus}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT — Invitation Overview */}
        <div className="bg-blue-900 text-white p-8 md:p-10 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">You&rsquo;re Invited</h1>
            <p className="text-blue-200 mb-6">
              This invite expires after 1 hour of generation.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-blue-300">Invited by</p>
                <p className="text-sm font-semibold">{inviteData.invitedBy}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-blue-300">Invited as</p>
                <p className="text-sm font-semibold">{inviteData.role}</p>
              </div>

              <div className="pt-4 border-t border-blue-700">
                <p className="text-xs text-blue-300">
                  Expires on{" "}
                  {new Date(inviteData.expiresAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-blue-300 mt-8">
            Secure invitation • One-time use
          </p>
        </div>

        {/* RIGHT — Account Setup */}
        <div className="p-6 md:p-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-1">
            Set up your account
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Complete the form below to accept your invitation.
          </p>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="agent@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={accepting}
            className="mt-6 w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {accepting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Accepting Invitation...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Accept Invitation
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to the terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
