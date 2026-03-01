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

type UseTwoFactorControlsOptions = {
  userId: string;
  initialEnabled?: boolean;
  toggleUrl?: string;
  sendCodeUrl?: string;
};

type UseTwoFactorControlsReturn = {
  enabled: boolean;
  isToggling: boolean;
  isSendingCode: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  setEnabledLocal: (value: boolean) => void;
  clearMessages: () => void;
  toggle2FA: (nextEnabled?: boolean) => Promise<void>;
  send2FACode: () => Promise<void>;
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

function useTwoFactorControls({
  userId,
  initialEnabled = false,
  toggleUrl = "/api/auth/2fa/toggle",
  sendCodeUrl = "/api/auth/2fa/send-code",
}: UseTwoFactorControlsOptions): UseTwoFactorControlsReturn {
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [isToggling, setIsToggling] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const setEnabledLocal = useCallback((value: boolean) => {
    setEnabled(value);
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
          // ignore JSON parse failure; handle below
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
        // ignore JSON parse failure
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

  return {
    enabled,
    isToggling,
    isSendingCode,
    loading: isToggling || isSendingCode,
    error,
    successMessage,
    setEnabledLocal,
    clearMessages,
    toggle2FA,
    send2FACode,
  };
}

type TwoFactorControlsProps = {
  userId: string;
  initialEnabled?: boolean;
  className?: string;
  toggleUrl?: string;
  sendCodeUrl?: string;
  autoSendCodeAfterEnable?: boolean; // optional convenience
};

export default function TwoFactorControls({
  userId,
  initialEnabled = false,
  className = "",
  toggleUrl = "/api/auth/2fa/toggle",
  sendCodeUrl = "/api/auth/2fa/send-code",
  autoSendCodeAfterEnable = false,
}: TwoFactorControlsProps) {
  const {
    enabled,
    isToggling,
    isSendingCode,
    loading,
    error,
    successMessage,
    toggle2FA,
    send2FACode,
  } = useTwoFactorControls({
    userId,
    initialEnabled,
    toggleUrl,
    sendCodeUrl,
  });

  const statusLabel = useMemo(() => (enabled ? "Enabled" : "Disabled"), [enabled]);

  const handleToggleClick = async () => {
    const next = !enabled;
    await toggle2FA(next);

    // Optional: immediately send code after enabling (if backend supports this flow)
    if (next && autoSendCodeAfterEnable) {
      await send2FACode();
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
        </div>

        {/* Simple switch-style button (no extra UI library needed) */}
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

        <button
          type="button"
          onClick={handleToggleClick}
          disabled={loading}
          aria-busy={isToggling}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isToggling ? "Saving..." : enabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
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
    </div>
  );
}
