"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EmailPreferencesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        consentNotifications: true,
        consentMarketing: false,
    });

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                // Fetch fresh data from API
                const token = localStorage.getItem("rentflow_tokens")
                    ? JSON.parse(localStorage.getItem("rentflow_tokens")!).accessToken
                    : null;

                if (!token) return;

                const res = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setPreferences({
                        consentNotifications: data.consentNotifications ?? true,
                        consentMarketing: data.consentMarketing ?? false,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch preferences", error);
                toast.error("Failed to load email preferences.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPreferences();
        }
    }, [user]);

    const handleToggle = async (key: "consentNotifications" | "consentMarketing", value: boolean) => {
        // Optimistic update
        setPreferences((prev) => ({ ...prev, [key]: value }));
        setSaving(true);

        try {
            const token = localStorage.getItem("rentflow_tokens")
                ? JSON.parse(localStorage.getItem("rentflow_tokens")!).accessToken
                : null;

            const res = await fetch("/api/auth/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ [key]: value }),
            });

            if (!res.ok) {
                throw new Error("Failed to update");
            }

            toast.success("Preferences updated.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes.");
            // Revert on error
            setPreferences((prev) => ({ ...prev, [key]: !value }));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
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
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="notifications">General Notifications</Label>
                            <p className="text-sm text-gray-500">
                                Receive updates about your account, billing, and maintenance requests.
                            </p>
                        </div>
                        <Switch
                            id="notifications"
                            checked={preferences.consentNotifications}
                            onCheckedChange={(checked) => handleToggle("consentNotifications", checked)}
                            disabled={saving}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="marketing">Marketing & Updates</Label>
                            <p className="text-sm text-gray-500">
                                Receive news, feature updates, and promotional content.
                            </p>
                        </div>
                        <Switch
                            id="marketing"
                            checked={preferences.consentMarketing}
                            onCheckedChange={(checked) => handleToggle("consentMarketing", checked)}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800">
                <strong>Note:</strong> Transactional emails (like password resets and email verification) cannot be disabled as they are required for your account security.
            </div>
        </div>
    );
}
