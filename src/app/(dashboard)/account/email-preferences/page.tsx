"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Preferences = {
  consentNotifications: boolean;
  consentMarketing: boolean;
};

type PreferenceKey = keyof Preferences;

type TokenStore = {
  accessToken?: string;
};

function getAccessToken(): string | null {
  try {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem("rentflow_tokens");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as TokenStore;
    return parsed.accessToken ?? null;
  } catch (error) {
    console.error("Failed to parse rentflow_tokens from localStorage", error);
    return null;
  }
}

function getFriendlyPreferenceName(key: PreferenceKey): string {
  switch (key) {
    case "consentNotifications":
      return "General notifications";
    case "consentMarketing":
      return "Marketing emails";
    default:
      return "Preferences";
  }
}

export default function EmailPreferencesPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<PreferenceKey | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    consentNotifications: true,
    consentMarketing: false,
  });

  const isSaving = savingKey !== null;

  const saveStatusMessage = useMemo(() => {
    if (!savingKey) return null;
    return `Saving ${getFriendlyPreferenceName(savingKey).toLowerCase()}...`;
  }, [savingKey]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPreferences = async () => {
      try {
        setLoading(true);

        const token = getAccessToken();

        if (!token) {
          if (isMounted) {
            toast.error("Please sign in again to manage email preferences.");
          }
          return;
        }

        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch preferences (${res.status})`);
        }

        const data = (await res.json()) as Partial<Preferences>;

        if (!isMounted) return;

        setPreferences({
          consentNotifications: data.consentNotifications ?? true,
          consentMarketing: data.consentMarketing ?? false,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Failed to fetch preferences", error);
        if (isMounted) {
          toast.error("Failed to load email preferences.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // If auth is not ready / no user, stop spinner and show sign-in prompt.
    if (!user) {
      setLoading(false);
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    void fetchPreferences();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user]);

  const handleToggle = async (key: PreferenceKey, value: boolean) => {
    if (isSaving) return;

    const previousValue = preferences[key];

    // Optimistic update
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSavingKey(key);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Please sign in again to continue.");
      }

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) {
        let message = "Failed to update preferences.";

        try {
          const err = (await res.json()) as { message?: string };
          if (err.message) {
            message = err.message;
          }
        } catch {
          // Ignore JSON parse errors for non-JSON responses
        }

        throw new Error(message);
      }

      toast.success(`${getFriendlyPreferenceName(key)} updated.`);
    } catch (error) {
      console.error("Failed to save preferences", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to save changes."
      );

      // Revert optimistic update on error
      setPreferences((prev) => ({ ...prev, [key]: previousValue }));
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div
        className="flex h-full items-center justify-center gap-2"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2
          className="h-6 w-6 animate-spin text-blue-600"
          aria-hidden="true"
        />
        <span className="text-sm text-gray-600">
          Loading email preferences...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>
              Please sign in to manage your email preferences.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6" aria-busy={isSaving}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email Preferences</h1>
        <p className="text-gray-500">Manage what emails you receive from us.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Control which categories of emails you want to receive.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">General Notifications</Label>
              <p
                id="notifications-description"
                className="text-sm text-gray-500"
              >
                Receive updates about your account, billing, and maintenance
                requests.
              </p>
            </div>

            <Switch
              id="notifications"
              checked={preferences.consentNotifications}
              onCheckedChange={(checked) =>
                void handleToggle("consentNotifications", checked)
              }
              disabled={isSaving}
              aria-label="Toggle general notifications"
              aria-describedby="notifications-description"
              className="shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing & Updates</Label>
              <p id="marketing-description" className="text-sm text-gray-500">
                Receive news, feature updates, and promotional content.
              </p>
            </div>

            <Switch
              id="marketing"
              checked={preferences.consentMarketing}
              onCheckedChange={(checked) =>
                void handleToggle("consentMarketing", checked)
              }
              disabled={isSaving}
              aria-label="Toggle marketing and updates emails"
              aria-describedby="marketing-description"
              className="shrink-0"
            />
          </div>

          {saveStatusMessage && (
            <div
              className="flex items-center gap-2 text-sm text-gray-500"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {saveStatusMessage}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Note:</strong> Transactional emails (like password resets and
        email verification) cannot be disabled because they are required for
        account security.
      </div>
    </div>
  );
}
