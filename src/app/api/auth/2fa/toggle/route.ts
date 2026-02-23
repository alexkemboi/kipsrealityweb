"use client";

import * as React from "react";
import { useTwoFactorToggle } from "@/hooks/useTwoFactorToggle";

interface TwoFactorToggleSwitchProps {
  initialEnabled?: boolean;
  endpoint?: string; // default matches your route
  className?: string;
  onChanged?: (enabled: boolean) => void;
}

export default function TwoFactorToggleSwitch({
  initialEnabled = false,
  endpoint = "/api/auth/2fa/toggle",
  className = "",
  onChanged,
}: TwoFactorToggleSwitchProps) {
  const { enabled, loading, error, toggle, clearError } = useTwoFactorToggle({
    initialEnabled,
    endpoint,
  });

  const handleChange = async () => {
    if (loading) return;
    clearError();

    const next = !enabled;
    const result = await toggle(next);

    if (result.ok) {
      onChanged?.(result.enabled);
    }
  };

  return (
    <div className={`w-full max-w-md rounded-xl border bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Add an extra layer of security to your account using your verified phone number.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Status:{" "}
            <span className={enabled ? "font-medium text-green-700" : "font-medium text-gray-700"}>
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>

        {/* Accessible custom switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-busy={loading}
          aria-label={enabled ? "Disable two-factor authentication" : "Enable two-factor authentication"}
          disabled={loading}
          onClick={handleChange}
          className={[
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            enabled ? "bg-blue-600" : "bg-gray-300",
            loading ? "cursor-not-allowed opacity-70" : "cursor-pointer",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200",
              enabled ? "translate-x-6" : "translate-x-1",
            ].join(" ")}
          />
        </button>
      </div>

      {loading && (
        <p className="mt-3 text-xs text-blue-600">Updating 2FA setting...</p>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
