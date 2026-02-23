"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { showCustomToast, ToastContainer } from "@/components/ui/custom-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield, ShieldCheck, Phone, Lock } from "lucide-react";

const OTP_LENGTH = 6;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

type ApiErrorPayload = { error?: string; message?: string };

async function parseApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ApiErrorPayload;
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Track which exact number is verified (prevents “verified” staying true after edits)
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);

  // OTP Verification State
  const [showVerificationUI, setShowVerificationUI] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!user) return;

    const serverPhone = user.phone || "";
    const phoneVerified = Boolean(user.phoneVerified);

    setPhoneNumber(serverPhone);
    setIs2FAEnabled(Boolean(user.twoFactorEnabled));
    setIsPhoneVerified(phoneVerified);
    setVerifiedPhoneNumber(phoneVerified && serverPhone ? serverPhone : null);
  }, [user]);

  const trimmedPhone = useMemo(() => phoneNumber.trim(), [phoneNumber]);

  const resetOtpState = () => {
    setOtpDigits(Array(OTP_LENGTH).fill(""));
  };

  const focusOtpInput = (index: number) => {
    otpRefs.current[index]?.focus();
  };

  // Handle OTP digit change
  const handleOtpChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "").slice(-1); // keep last numeric char only
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < OTP_LENGTH - 1) {
      focusOtpInput(index + 1);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    e.preventDefault();

    const nextDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, idx) => {
      nextDigits[idx] = char;
    });

    setOtpDigits(nextDigits);

    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusOtpInput(nextFocusIndex);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      focusOtpInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      focusOtpInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusOtpInput(index + 1);
    }
  };

  const handlePhoneInputChange = (value: string) => {
    setPhoneNumber(value);

    // If user edits away from verified number, mark as unverified
    const normalized = value.trim();
    if (!verifiedPhoneNumber || normalized !== verifiedPhoneNumber) {
      setIsPhoneVerified(false);
    } else {
      setIsPhoneVerified(true);
    }
  };

  // Handle sending OTP for phone verification
  const handleSendVerificationOtp = async () => {
    if (!trimmedPhone) {
      showCustomToast("Please enter a phone number first", "error");
      return;
    }

    if (!E164_REGEX.test(trimmedPhone)) {
      showCustomToast(
        "Phone number must be in valid E.164 format (e.g., +254712345678)",
        "error"
      );
      return;
    }

    setIsSendingOtp(true);
    try {
      // Save / update phone first
      const updateResponse = await fetch("/api/auth/phone/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmedPhone }),
      });

      if (!updateResponse.ok) {
        const message = await parseApiError(updateResponse, "Failed to update phone number");
        showCustomToast(message, "error");
        return;
      }

      // Send verification OTP
      const sendResponse = await fetch("/api/auth/phone/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmedPhone }),
      });

      if (!sendResponse.ok) {
        const message = await parseApiError(sendResponse, "Failed to send verification code");
        showCustomToast(message, "error");
        return;
      }

      resetOtpState();
      setShowVerificationUI(true);
      showCustomToast("Verification code sent to your phone", "success");

      // focus first OTP after UI shows
      setTimeout(() => focusOtpInput(0), 50);
    } catch (error) {
      console.error("Send OTP error:", error);
      showCustomToast("An error occurred while sending verification code", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const fullCode = otpDigits.join("");
    if (fullCode.length !== OTP_LENGTH) {
      showCustomToast("Please enter a valid 6-digit code", "error");
      return;
    }

    if (!trimmedPhone) {
      showCustomToast("Phone number is missing", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmedPhone, code: fullCode }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Invalid or expired code");
        showCustomToast(message, "error");
        return;
      }

      showCustomToast("Phone number verified successfully", "success");
      setIsPhoneVerified(true);
      setVerifiedPhoneNumber(trimmedPhone);
      setShowVerificationUI(false);
      resetOtpState();
      await refreshUser();
    } catch (error) {
      console.error("Verify OTP error:", error);
      showCustomToast("An error occurred during verification", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle enabling 2FA
  const handleEnable2FA = async () => {
    if (!trimmedPhone) {
      showCustomToast("Please add a phone number first", "error");
      return;
    }

    if (!isPhoneVerified) {
      showCustomToast("Please verify your phone number first", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: true }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to enable 2FA");
        showCustomToast(message, "error");
        return;
      }

      showCustomToast("2FA enabled successfully!", "success");
      setIs2FAEnabled(true);
      await refreshUser();
    } catch (error) {
      console.error("Enable 2FA error:", error);
      showCustomToast("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disabling 2FA
  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: false }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to disable 2FA");
        showCustomToast(message, "error");
        return;
      }

      showCustomToast("2FA disabled successfully!", "success");
      setIs2FAEnabled(false);
      await refreshUser();
    } catch (error) {
      console.error("Disable 2FA error:", error);
      showCustomToast("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle change
  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      if (!trimmedPhone || !isPhoneVerified) {
        showCustomToast("Please add and verify a phone number first", "error");
        return;
      }
      await handleEnable2FA();
    } else {
      await handleDisable2FA();
    }
  };

  const isOtpComplete = otpDigits.every((d) => d !== "");

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security & 2FA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={user?.firstName ?? ""} disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={user?.lastName ?? ""} disabled readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled readOnly />
              </div>
              <div className="flex justify-end">
                <Button disabled>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Secure your account with SMS verification.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!showVerificationUI ? (
                <>
                  {/* Phone Number Section */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number (for OTP)
                    </Label>

                    <div className="flex gap-2">
                      <Input
                        value={phoneNumber}
                        onChange={(e) => handlePhoneInputChange(e.target.value)}
                        placeholder="+254712345678"
                        disabled={is2FAEnabled || isSendingOtp || isVerifying || isLoading}
                      />

                      {!is2FAEnabled && (
                        <Button
                          variant="outline"
                          onClick={handleSendVerificationOtp}
                          disabled={isSendingOtp || isLoading}
                          type="button"
                        >
                          {isSendingOtp ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {isPhoneVerified ? (
                        <span className="flex items-center gap-1 text-green-600">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          ⚠ Not verified
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Format: +254712345678
                      </span>
                    </div>
                  </div>

                  <div className="my-4 border-t" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable 2FA</Label>
                      <p className="text-sm text-gray-500">
                        {is2FAEnabled
                          ? "Your account is protected with 2FA"
                          : "Secure your account with 2FA"}
                      </p>
                    </div>

                    <Switch
                      checked={is2FAEnabled}
                      onCheckedChange={handleToggle2FA}
                      disabled={isLoading || (!isPhoneVerified && !is2FAEnabled)}
                    />
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Verify Phone Number</h3>
                    <p className="leading-relaxed text-sm text-gray-500">
                      We&apos;ve sent a 6-digit verification code to{" "}
                      <span className="font-semibold text-gray-700">{trimmedPhone}</span>.
                      Enter it below to secure your account.
                    </p>
                  </div>

                  <div className="mx-auto flex max-w-sm justify-between gap-3">
                    {otpDigits.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onPaste={handleOtpPaste}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold focus:border-primary focus:ring-0"
                        disabled={isVerifying}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Didn&apos;t receive the code?{" "}
                      <button
                        type="button"
                        onClick={handleSendVerificationOtp}
                        className="font-semibold text-primary underline decoration-2 underline-offset-4 hover:underline"
                        disabled={isSendingOtp || isVerifying}
                      >
                        {isSendingOtp ? "Sending..." : "Resend Code"}
                      </button>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      className="w-full rounded-2xl bg-primary py-6 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] hover:bg-blue-600"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || !isOtpComplete}
                    >
                      {isVerifying ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        "Verify & Continue"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-gray-500"
                      onClick={() => {
                        setShowVerificationUI(false);
                        resetOtpState();
                      }}
                      disabled={isVerifying}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="pt-4 text-center">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                      Standard Carrier Rates Apply
                    </span>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Toast Notification */}
      <ToastContainer />
    </div>
  );
}
