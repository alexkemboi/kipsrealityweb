"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { showCustomToast, ToastContainer } from "@/components/ui/custom-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield, ShieldCheck, Phone, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // OTP Verification State
  const [showVerificationUI, setShowVerificationUI] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phone || "");
      setIs2FAEnabled(user.twoFactorEnabled || false);
      setIsPhoneVerified(!!user.phoneVerified);
    }
  }, [user]);

  // Handle OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle sending OTP for phone verification
  const handleSendVerificationOtp = async () => {
    if (!phoneNumber) {
      showCustomToast("Please enter a phone number first", "error");
      return;
    }

    // Validate phone format
    if (!phoneNumber.startsWith("+")) {
      showCustomToast("Phone number must be in E.164 format (e.g., +254712345678)", "error");
      return;
    }

    setIsSendingOtp(true);
    try {
      // First update the phone number
      const updateResponse = await fetch('/api/auth/phone/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        showCustomToast(error.error || "Failed to update phone number", "error");
        setIsSendingOtp(false);
        return;
      }

      // Then send OTP for verification
      const sendResponse = await fetch('/api/auth/phone/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      if (sendResponse.ok) {
        showCustomToast("Verification code sent to your phone", "success");
        setShowVerificationUI(true);
      } else {
        const error = await sendResponse.json();
        showCustomToast(error.error || "Failed to send verification code", "error");
      }
    } catch (error) {
      showCustomToast("An error occurred", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      showCustomToast("Please enter a valid 6-digit code", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, code: fullCode })
      });

      if (response.ok) {
        showCustomToast("Phone Number Verified Successfully", "success");
        setIsPhoneVerified(true);
        setShowVerificationUI(false);
        setOtpDigits(["", "", "", "", "", ""]);
        await refreshUser();
      } else {
        const error = await response.json();
        showCustomToast(error.error || "Invalid or expired code", "error");
      }
    } catch (error) {
      showCustomToast("An error occurred during verification", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle enabling 2FA
  const handleEnable2FA = async () => {
    if (!phoneNumber) {
      showCustomToast("Please add a phone number first", "error");
      return;
    }

    if (!isPhoneVerified) {
      showCustomToast("Please verify your phone number first", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: true })
      });

      if (response.ok) {
        showCustomToast("2FA enabled successfully!", "success");
        setIs2FAEnabled(true);
        await refreshUser();
      } else {
        const error = await response.json();
        showCustomToast(error.error || "Failed to enable 2FA", "error");
      }
    } catch (error) {
      showCustomToast("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disabling 2FA
  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: false })
      });

      if (response.ok) {
        showCustomToast("2FA disabled successfully!", "success");
        setIs2FAEnabled(false);
        await refreshUser();
      } else {
        const error = await response.json();
        showCustomToast(error.error || "Failed to disable 2FA", "error");
      }
    } catch (error) {
      showCustomToast("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle change
  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      // Check if phone is verified before enabling
      if (!phoneNumber || !isPhoneVerified) {
        showCustomToast("Please add and verify a phone number first", "error");
        return;
      }
      await handleEnable2FA();
    } else {
      await handleDisable2FA();
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

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

        {/* --- TAB 1: PROFILE --- */}
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
                  <Input defaultValue={user?.firstName} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue={user?.lastName} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user?.email} disabled />
              </div>
              <div className="flex justify-end">
                <Button disabled>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: SECURITY (2FA) --- */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Secure your account with SMS verification. We will send a code to your phone every time you log in.
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
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+254712345678"
                        disabled={is2FAEnabled}
                      />
                      {!is2FAEnabled && (
                        <Button
                          variant="outline"
                          onClick={handleSendVerificationOtp}
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {isPhoneVerified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1">
                          ⚠ Not verified
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">Format: +254712345678</span>
                    </div>
                  </div>

                  <div className="border-t my-4" />

                  {/* The 2FA Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable 2FA</Label>
                      <p className="text-sm text-gray-500">
                        {is2FAEnabled
                          ? "Your account is protected with 2FA"
                          : "We will send a code to your phone every time you log in"}
                        {isPhoneVerified && !is2FAEnabled && " - Click to enable"}
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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Verify Phone Number</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      We've sent a 6-digit verification code to <span className="font-semibold text-gray-700">{phoneNumber}</span>. Enter it below to secure your account.
                    </p>
                  </div>

                  <div className="flex justify-between gap-3 max-w-sm mx-auto">
                    {otpDigits.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-primary focus:ring-0 rounded-xl"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleSendVerificationOtp}
                        className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? "Sending..." : "Resend Code"}
                      </button>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || otpDigits.some(d => !d)}
                    >
                      {isVerifying ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Verify & Continue"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-gray-500"
                      onClick={() => setShowVerificationUI(false)}
                      disabled={isVerifying}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="pt-4 text-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
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
