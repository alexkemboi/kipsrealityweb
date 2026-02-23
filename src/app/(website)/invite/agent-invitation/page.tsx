"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  KeyRound,
  User,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { useAgentInvite } from "@/hooks/useAgentInvite";

function StatusCard({
  icon,
  title,
  description,
  action,
  tone = "default",
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  tone?: "default" | "error" | "success";
}) {
  const toneStyles =
    tone === "error"
      ? "from-red-50 to-white border-red-100"
      : tone === "success"
      ? "from-blue-50 to-white border-blue-100"
      : "from-white to-white border-slate-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div
        className={`bg-gradient-to-b ${toneStyles} rounded-2xl shadow-xl p-8 max-w-md w-full text-center border`}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100">
          {icon}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="text-gray-600 mb-6">{description}</div>
        {action}
      </div>
    </div>
  );
}

function PasswordChecklist({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a letter", ok: /[A-Za-z]/.test(password) },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Passwords match", ok: !!password && !!confirmPassword && password === confirmPassword },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-xs font-semibold text-slate-700 mb-2">Password Requirements</p>
      <ul className="space-y-1.5">
        {checks.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs">
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                item.ok
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
              aria-hidden="true"
            >
              {item.ok ? "✓" : "•"}
            </span>
            <span className={item.ok ? "text-emerald-700" : "text-slate-600"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

  const formattedExpiry = useMemo(() => {
    if (!inviteData?.expiresAt) return null;
    const d = new Date(inviteData.expiresAt);
    if (Number.isNaN(d.getTime())) return null;
    return {
      date: d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  }, [inviteData?.expiresAt]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  const passwordsMatch =
    !!formData.password &&
    !!formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  // Loading state
  if (!isClient || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-white px-4"
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-900" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Loading invitation</p>
              <p className="text-sm text-slate-500">Please wait while we verify your invite token…</p>
            </div>
          </div>

          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-1/2 bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-11 w-full bg-blue-100 rounded-xl mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // Missing token
  if (!token) {
    return (
      <StatusCard
        tone="error"
        icon={<XCircle className="w-10 h-10 text-red-500" />}
        title="Missing Invitation Token"
        description={
          <p>
            This invitation link is incomplete. Please request a new invitation from your administrator.
          </p>
        }
      />
    );
  }

  // Invalid invite state
  if (!inviteData?.isValid) {
    return (
      <StatusCard
        tone="error"
        icon={<XCircle className="w-10 h-10 text-red-500" />}
        title="Invalid Invitation"
        description={
          <p>
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
        }
      />
    );
  }

  // Success state
  if (status === "success") {
    return (
      <StatusCard
        tone="success"
        icon={<CheckCircle className="w-10 h-10 text-blue-900" />}
        title="Invitation Accepted"
        description={
          <>
            <p className="text-gray-600">Your account has been created successfully.</p>

            <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-900 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Verify your email</p>
                  <p className="text-sm text-gray-700 mt-1">
                    We sent a verification email to{" "}
                    <span className="font-semibold break-all">{formData.email}</span>. Please open your inbox and click
                    the verification link.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-5">If you don’t see it, check your spam folder.</p>
          </>
        }
      />
    );
  }

  // Error state
  if (status === "error") {
    return (
      <StatusCard
        tone="error"
        icon={<AlertTriangle className="w-10 h-10 text-red-500" />}
        title="Something Went Wrong"
        description={
          <p>
            We couldn&apos;t process your invitation at this time. Please try again or contact support.
          </p>
        }
        action={
          <button
            type="button"
            onClick={resetStatus}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        }
      />
    );
  }

  // Main form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden border border-white/70 bg-white/90 backdrop-blur shadow-[0_20px_60px_-20px_rgba(2,6,23,0.25)] grid grid-cols-1 md:grid-cols-2">
        {/* LEFT — Invitation Overview */}
        <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-16 -right-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-8 -left-10 h-36 w-36 rounded-full bg-blue-300/30 blur-2xl" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold mb-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Invitation
            </div>

            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">You&rsquo;re Invited</h1>
            <p className="text-blue-200 mb-6">
              Complete your account setup to join the workspace.
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wider text-blue-300 mb-1">Invited by</p>
                <p className="text-sm font-semibold break-words">{inviteData.invitedBy || "Administrator"}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wider text-blue-300 mb-1">Role</p>
                <p className="text-sm font-semibold">{inviteData.role || "Agent"}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <CalendarClock className="w-4 h-4 text-blue-200 mt-0.5" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-blue-300 mb-1">Expiration</p>
                    <p className="text-sm font-semibold">
                      {formattedExpiry ? `${formattedExpiry.date} at ${formattedExpiry.time}` : "1 hour from generation"}
                    </p>
                    <p className="text-xs text-blue-200 mt-1">One-time use invite link</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-blue-200/90 mt-8">
            This link is protected and should not be shared.
          </p>
        </div>

        {/* RIGHT — Account Setup */}
        <div className="p-6 md:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-1 tracking-tight">
              Set up your account
            </h2>
            <p className="text-sm text-gray-500">
              Complete the form below to accept your invitation.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  disabled={accepting}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:outline-none transition ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="text-xs text-red-500 mt-1" role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={accepting}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:outline-none transition ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="agent@example.com"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={accepting}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : "password-help"}
                  className={`w-full rounded-xl border pl-9 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:outline-none transition ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={accepting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!errors.password && (
                <p id="password-help" className="text-xs text-gray-500 mt-1">
                  Use a strong password with letters and numbers.
                </p>
              )}
              {errors.password && (
                <p id="password-error" className="text-xs text-red-500 mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={accepting}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  className={`w-full rounded-xl border pl-9 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:outline-none transition ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={accepting}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.confirmPassword ? (
                <p id="confirmPassword-error" className="text-xs text-red-500 mt-1" role="alert">
                  {errors.confirmPassword}
                </p>
              ) : formData.confirmPassword ? (
                <p className={`text-xs mt-1 ${passwordsMatch ? "text-emerald-600" : "text-amber-600"}`}>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match yet"}
                </p>
              ) : null}
            </div>

            <PasswordChecklist password={formData.password} confirmPassword={formData.confirmPassword} />

            {/* CTA */}
            <button
              type="submit"
              disabled={accepting}
              className="mt-2 w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to the terms and conditions.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
