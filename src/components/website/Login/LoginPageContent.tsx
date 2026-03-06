'use client'
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import Link from "next/link";

type DashboardRole = "SYSTEM_ADMIN" | "PROPERTY_MANAGER" | "TENANT" | "VENDOR" | "AGENT";

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: DashboardRole;
  avatarUrl?: string;
  phone?: string | null;
  phoneVerified?: Date | null;
  twoFactorEnabled?: boolean;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  organizationUserId?: string;
  consentNotifications?: boolean;
  consentMarketing?: boolean;
};

type LoginSuccessResponse = {
  user?: {
    role?: DashboardRole;
    [key: string]: unknown;
  };
  session?: {
    expiresAt?: number;
  };
  require2FA?: boolean;
  message?: string;
};

function getDashboardPath(role: DashboardRole): string {
  switch (role) {
    case "SYSTEM_ADMIN":
      return "/admin";
    case "PROPERTY_MANAGER":
      return "/property-manager";
    case "TENANT":
      return "/tenant";
    case "VENDOR":
      return "/vendor";
    case "AGENT":
      return "/agent";
    default:
      return "/";
  }
}

const LoginPageContent = () => {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Handle Verification Toasts
  useEffect(() => {
    const verified = searchParams.get('verified');
    const errorParam = searchParams.get('error');

    if (verified === 'true') {
      toast.success("Email verified successfully! Please log in.", {
        duration: 6000,
        className: 'bg-navy-50 text-green-800 border-navy-200'
      });
      // Clean URL
      router.replace('/login');
    }

    if (errorParam) {
      let msg = "Authentication error";
      if (errorParam === 'invalid_token') msg = "Verification link is invalid or expired.";
      if (errorParam === 'missing_token') msg = "Invalid verification link.";

      toast.error(msg, {
        duration: 6000,
      });
      setError(msg);
      router.replace('/login');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setShowResendVerification(false);
    setDevVerificationUrl(null);

    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!normalizedEmail || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as LoginSuccessResponse;

        if (data.require2FA) {
          const msg = data.message || "Two-factor authentication is required for this account.";
          setError(msg);
          toast.info(msg, { duration: 5000 });
          return;
        }

        if (!data.user || !data.session?.expiresAt || !data.user.role) {
          throw new Error("Login response was incomplete. Please try again.");
        }

        const apiUser = data.user as Record<string, unknown>;
        if (
          typeof apiUser.id !== "string" ||
          typeof apiUser.email !== "string" ||
          typeof apiUser.firstName !== "string" ||
          typeof apiUser.lastName !== "string"
        ) {
          throw new Error("Login response user payload was invalid.");
        }

        const userPayload: AuthUser = {
          id: apiUser.id,
          email: apiUser.email,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          role: data.user.role,
          avatarUrl: typeof apiUser.avatarUrl === "string" ? apiUser.avatarUrl : undefined,
          phone: typeof apiUser.phone === "string" || apiUser.phone === null ? apiUser.phone : undefined,
          phoneVerified:
            typeof apiUser.phoneVerified === "string"
              ? (isNaN(new Date(apiUser.phoneVerified).getTime()) ? null : new Date(apiUser.phoneVerified))
              : apiUser.phoneVerified === null
                ? null
                : undefined,
          twoFactorEnabled: typeof apiUser.twoFactorEnabled === "boolean" ? apiUser.twoFactorEnabled : undefined,
          organizationUserId: typeof apiUser.organizationUserId === "string" ? apiUser.organizationUserId : undefined,
          consentNotifications:
            typeof apiUser.consentNotifications === "boolean" ? apiUser.consentNotifications : undefined,
          consentMarketing:
            typeof apiUser.consentMarketing === "boolean" ? apiUser.consentMarketing : undefined,
        };

        login(userPayload, {
          accessToken: '',
          refreshToken: '',
          expiresAt: data.session.expiresAt,
        });

        toast.success("Login successful! Redirecting...");

        const role = data.user.role as DashboardRole;
        router.replace(getDashboardPath(role));

      } else {
        const err = await response.json().catch(() => ({}));
        let errorMsg = err.error || 'Invalid credentials';

        if (response.status === 404) {
          errorMsg = 'User does not exist. Please create an account to continue.';
        } else if (response.status === 401) {
          // credential mismatch
          errorMsg = 'Invalid email or password.';
        } else if (response.status === 403 && err?.requiresVerification) {
          errorMsg = 'Please verify your email before logging in.';
          setShowResendVerification(true);
        }

        setError(errorMsg);
        toast.error(errorMsg, { duration: 4000 });
      }
    } catch {
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Enter your email first to resend verification.');
      return;
    }

    if (resendCooldown > 0) {
      return;
    }

    try {
      setIsResending(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to resend verification email right now.');
      }

      toast.success(data?.message || 'If your account is pending verification, we sent a new email.');
      setDevVerificationUrl(typeof data?.verificationUrl === 'string' ? data.verificationUrl : null);
      setResendCooldown(60);
      setError('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to resend verification email right now.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full p-8 lg:p-10">
      <Logo className="w-28 h-28" />

      <div className="text-center mb-8">
        <p className="text-neutral-500 text-sm lg:text-base">
          Sign in to manage your properties and access your dashboard
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            <Mail className="w-5 h-5" />
          </div>
          <Input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleInputChange}
            autoComplete="email"
            required
            className="h-12 pl-11 pr-4 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="current-password"
            required
            className="h-12 pl-11 pr-12 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-neutral-500 hover:text-[#003b73] font-medium hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {showResendVerification && (
          <div className="space-y-2 text-center">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className="w-full text-sm text-[#003b73] hover:underline disabled:opacity-60"
            >
              {isResending
                ? 'Sending verification email...'
                : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend verification email'}
            </button>
            {devVerificationUrl && (
              <div className="space-y-1">
                <p className="text-xs text-amber-700">
                  SMTP is not configured in this environment. Use the link below to verify directly.
                </p>
                <a
                  href={devVerificationUrl}
                  className="text-xs text-neutral-500 hover:text-neutral-700 underline"
                >
                  Verify now (dev only)
                </a>
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#003b73] hover:bg-[#002b5b] text-white text-base font-semibold transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Signing In...
            </div>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center mt-8 pt-6 border-t border-neutral-100">
        <p className="text-neutral-500">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-neutral-600 hover:text-[#003b73] font-semibold underline underline-offset-2 transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPageContent;
