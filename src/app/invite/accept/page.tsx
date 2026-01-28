"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Validation Schema
const acceptInviteSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function InviteFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  interface InviteData {
    email: string;
    organizationName: string;
    role: string;
  }

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof acceptInviteSchema>>({
    resolver: zodResolver(acceptInviteSchema),
  });

  // 1. Validate Token on Mount
  useEffect(() => {
    if (!token) {
      setError("Missing invite token.");
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/invites/validate?token=${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setInviteData(data);
        } else {
          setError(data.error || "Invalid invite.");
        }
      } catch (err) {
        setError("Failed to validate invite. Please try again.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // 2. Handle Form Submission
  const onSubmit = async (values: z.infer<typeof acceptInviteSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: inviteData?.email || "", // Passed from validation data for safety
          ...values
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Account created successfully!");
      
      // Redirect to login with success message
      router.push("/login?verified=true");
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER STATES ---

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Verifying your invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center p-6 border-red-200">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invite Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Building2 className="w-5 h-5" />
            <span className="font-semibold tracking-tight">RentFlow360</span>
          </div>
          <CardTitle className="text-2xl font-bold">Accept Invitation</CardTitle>
          <CardDescription>
            You have been invited to join <strong>{inviteData?.organizationName}</strong> as a {inviteData?.role.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Read-Only Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <Input value={inviteData?.email} disabled className="bg-gray-100 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input {...form.register("firstName")} placeholder="John" />
                {form.formState.errors.firstName && <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input {...form.register("lastName")} placeholder="Doe" />
                {form.formState.errors.lastName && <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input {...form.register("phone")} placeholder="+254..." />
              {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Create Password</label>
              <Input type="password" {...form.register("password")} placeholder="••••••••" />
              {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input type="password" {...form.register("confirmPassword")} placeholder="••••••••" />
              {form.formState.errors.confirmPassword && <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up account...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
      <InviteFormContent />
    </Suspense>
  );
}