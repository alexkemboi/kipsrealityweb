"use client";

import React, { useEffect, useState } from "react";
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

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem("rentflow_tokens");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed?.accessToken ?? null;
  } catch (error) {
    console.error("Failed to parse rentflow_tokens from localStorage", error);
    return null;
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

  useEffect(() => {
    let isMounted = true;

    const fetchPreferences = async () => {
      setLoading(true);

      try {
        const token = getAccessToken();

        if (!token) {
          if (isMounted) {
            toast.error("Please sign in again to manage email preferences.");
          }
          return;
        }

        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch preferences (${res.status})`);
        }

        const data = (await res.json()) as Partial<Preferences>;

        if (isMounted) {
          setPreferences({
            consentNotifications: data.consentNotifications ?? true,
            consentMarketing: data.consentMarketing ?? false,
          });
        }
      } catch (error) {
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

    // Prevent spinner from hanging forever when user is absent / auth not ready.
    if (!user) {
      setLoading(false);
      return;
    }

    fetchPreferences();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggle = async (key: PreferenceKey, value: boolean) => {
    // Prevent overlapping requests for cleaner UX/state consistency
    if (savingKey) return;

    const previousValue = preferences[key];

    // Optimistic update
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSavingKey(key);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Missing auth token");
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
        let message = "Failed to update preferences";

        try {
          const err = (await res.json()) as { message?: string };
          if (err?.message) message = err.message;
        } catch {
          // Non-JSON error response; use generic message
        }

        throw new Error(message);
      }

      toast.success("Preferences updated.");
    } catch (error) {
      console.error("Failed to save preferences", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save changes."
      );

      // Revert on error
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
      >
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden="true" />
        <span className="text-sm text-gray-600">Loading email preferences...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
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
    <div className="p-6 max-w-2xl mx-auto space-y-6" aria-busy={savingKey !== null}>
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
              <p className="text-sm text-gray-500">
                Receive updates about your account, billing, and maintenance requests.
              </p>
            </div>

            <Switch
              id="notifications"
              checked={preferences.consentNotifications}
              onCheckedChange={(checked) =>
                handleToggle("consentNotifications", checked)
              }
              disabled={savingKey !== null}
              aria-label="Toggle general notifications"
              className="shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing & Updates</Label>
              <p className="text-sm text-gray-500">
                Receive news, feature updates, and promotional content.
              </p>
            </div>

            <Switch
              id="marketing"
              checked={preferences.consentMarketing}
              onCheckedChange={(checked) =>
                handleToggle("consentMarketing", checked)
              }
              disabled={savingKey !== null}
              aria-label="Toggle marketing and updates emails"
              className="shrink-0"
            />
          </div>

          {savingKey && (
            <div
              className="flex items-center gap-2 text-sm text-gray-500"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving changes...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Note:</strong> Transactional emails (like password resets and email
        verification) cannot be disabled because they are required for account security.
      </div>
    </div>
  );
}
