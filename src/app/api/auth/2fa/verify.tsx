"use client";

import { useCallback, useMemo, useState } from "react";

type Toggle2FAResponse = {
  success?: boolean;
  enabled?: boolean;
  error?: string;
  message?: string;
};

type SendCodeResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

type Verify2FAResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    role?: string;
    organizationUserId?: string | null;
    organization?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
};

type UseTwoFactorControlsOptions = {
  userId: string;
  initialEnabled?: boolean;
  toggleUrl?: string;
  sendCodeUrl?: string;
  verifyUrl?: string;
};

type UseTwoFactorControlsReturn = {
  enabled: boolean;
  otpCode: string;
  isToggling: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  verifyResult: Verify2FAResponse | null;
  setOtpCode: (value: string) => void;
  setEnabledLocal: (value: boolean) => void;
  clearMessages: () => void;
  toggle2FA: (nextEnabled?: boolean) => Promise<void>;
  send2FACode: () => Promise<void>;
  verify2FACode: () => Promise<Verify2FAResponse | null>;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }

  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return fallback;
}

function sanitizeOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function useTwoFactorControls({
  userId,
  initialEnabled = false,
  toggleUrl = "/api/auth/2fa/toggle",
  sendCodeUrl = "/api/auth/2fa/send-code",
  verifyUrl = "/api/auth/2fa/verify",
}: UseTwoFactorControlsOptions): UseTwoFactorControlsReturn {
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [otpCode, setOtpCodeState] = useState("");
  const [isToggling, setIsToggling] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<Verify2FAResponse | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const setEnabledLocal = useCallback((value: boolean) => {
    setEnabled(value);
  }, []);

  const setOtpCode = useCallback((value: string) => {
    setOtpCodeState(sanitizeOtp(value));
  }, []);

  const toggle2FA = useCallback(
    async (nextEnabled?: boolean) => {
      const target = typeof nextEnabled === "boolean" ? nextEnabled : !enabled;

      setIsToggling(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const res = await fetch(toggleUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ enable: target }),
        });

        let data: Toggle2FAResponse | null = null;
        try {
          data = (await res.json()) as Toggle2FAResponse;
        } catch {
          // ignore json parsing failure
        }

        if (!res.ok) {
          throw new Error(
            getErrorMessage(data, `Failed to ${target ? "enable" : "disable"} 2FA`)
          );
        }

        const finalEnabled =
          typeof data?.enabled === "boolean" ? data.enabled : target;

        setEnabled(finalEnabled);
        setSuccessMessage(finalEnabled ? "2FA enabled." : "2FA disabled.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update 2FA");
      } finally {
        setIsToggling(false);
      }
    },
    [enabled, toggleUrl]
  );

  const send2FACode = useCallback(async () => {
    if (!userId?.trim()) {
      setError("Missing user ID");
      return;
    }

    setIsSendingCode(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(sendCodeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      let data: SendCodeResponse | null = null;
      try {
        data = (await res.json()) as SendCodeResponse;
      } catch {
        // ignore json parsing failure
      }

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to send 2FA code"));
      }

      setSuccessMessage(data?.message || "2FA code sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send 2FA code");
    } finally {
      setIsSendingCode(false);
    }
  }, [sendCodeUrl, userId]);

  const verify2FACode = useCallback(async () => {
    if (!userId?.trim()) {
      setError("Missing user ID");
      return null;
    }

    if (!otpCode || otpCode.length < 4) {
      setError("Enter a valid verification code");
      return null;
    }

    setIsVerifyingCode(true);
    setError(null);
    setSuccessMessage(null);
    setVerifyResult(null);

    try {
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important: lets cookie set work properly
        body: JSON.stringify({ userId, code: otpCode }),
      });

      let data: Verify2FAResponse | null = null;
      try {
        data = (await res.json()) as Verify2FAResponse;
      } catch {
        // ignore json parsing failure
      }

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to verify 2FA code"));
      }

      setVerifyResult(data);
      setSuccessMessage("Code verified successfully.");
      setOtpCodeState("");
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
      return null;
    } finally {
      setIsVerifyingCode(false);
    }
  }, [otpCode, userId, verifyUrl]);

  return {
    enabled,
    otpCode,
    isToggling,
    isSendingCode,
    isVerifyingCode,
    loading: isToggling || isSendingCode || isVerifyingCode,
    error,
    successMessage,
    verifyResult,
    setOtpCode,
    setEnabledLocal,
    clearMessages,
    toggle2FA,
    send2FACode,
    verify2FACode,
  };
}

type TwoFactorControlsProps = {
  userId: string;
  initialEnabled?: boolean;
  className?: string;
  toggleUrl?: string;
  sendCodeUrl?: string;
  verifyUrl?: string;
  autoSendCodeAfterEnable?: boolean;
  showToggle?: boolean; // use false for login challenge screen
  onVerified?: (result: Verify2FAResponse) => void | Promise<void>;
};

export default function TwoFactorControls({
  userId,
  initialEnabled = false,
  className = "",
  toggleUrl = "/api/auth/2fa/toggle",
  sendCodeUrl = "/api/auth/2fa/send-code",
  verifyUrl = "/api/auth/2fa/verify",
  autoSendCodeAfterEnable = false,
  showToggle = true,
  onVerified,
}: TwoFactorControlsProps) {
  const {
    enabled,
    otpCode,
    isToggling,
    isSendingCode,
    isVerifyingCode,
    loading,
    error,
    successMessage,
    verifyResult,
    setOtpCode,
    toggle2FA,
    send2FACode,
    verify2FACode,
  } = useTwoFactorControls({
    userId,
    initialEnabled,
    toggleUrl,
    sendCodeUrl,
    verifyUrl,
  });

  const statusLabel = useMemo(() => (enabled ? "Enabled" : "Disabled"), [enabled]);

  const handleToggleClick = async () => {
    const next = !enabled;
    await toggle2FA(next);

    if (next && autoSendCodeAfterEnable) {
      await send2FACode();
    }
  };

  const handleVerify = async () => {
    const result = await verify2FACode();
    if (result?.success && onVerified) {
      await onVerified(result);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Add an extra security layer to your account using SMS verification.
          </p>

          {showToggle ? (
            <p className="mt-2 text-sm">
              <span className="font-medium text-gray-700">Status:</span>{" "}
              <span
                className={
                  enabled ? "font-semibold text-green-700" : "font-semibold text-gray-700"
                }
              >
                {statusLabel}
              </span>
            </p>
          ) : null}
        </div>

        {showToggle ? (
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={loading}
            aria-pressed={enabled}
            aria-busy={isToggling}
            className={[
              "relative inline-flex h-7 w-14 items-center rounded-full transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              enabled ? "bg-green-600" : "bg-gray-300",
              loading ? "cursor-not-allowed opacity-70" : "cursor-pointer",
            ].join(" ")}
            title={enabled ? "Disable 2FA" : "Enable 2FA"}
          >
            <span
              className={[
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                enabled ? "translate-x-8" : "translate-x-1",
              ].join(" ")}
            />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={send2FACode}
          disabled={loading || !userId}
          aria-busy={isSendingCode}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSendingCode ? "Sending code..." : "Send 2FA Code"}
        </button>

        {showToggle ? (
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={loading}
            aria-busy={isToggling}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isToggling ? "Saving..." : enabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        ) : null}
      </div>

      {/* OTP Verify Section */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <label htmlFor="twofa-code" className="block text-sm font-medium text-gray-700">
          Enter verification code
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="twofa-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleVerify();
              }
            }}
            className="w-full sm:w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            maxLength={6}
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otpCode.length < 4}
            aria-busy={isVerifyingCode}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifyingCode ? "Verifying..." : "Verify Code"}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Tip: Click <strong>Send 2FA Code</strong> first, then enter the SMS code and verify.
        </p>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {verifyResult?.success && verifyResult.user ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-800">
          <div className="font-medium">Verified successfully</div>
          <div className="mt-1">
            Signed in as {verifyResult.user.firstName || "User"} ({verifyResult.user.email})
          </div>
        </div>
      ) : null}
    </div>
  );
}
