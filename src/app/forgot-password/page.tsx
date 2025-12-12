'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            // Always show success to prevent email enumeration
            setIsSubmitted(true);
            toast.success("If an account exists, a reset code has been sent.");

        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="flex justify-center">
                    <Logo />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-gray-500">Enter your email to receive a reset link</p>
                </div>

                {isSubmitted ? (
                    <div className="text-center space-y-6 bg-green-50 p-6 rounded-xl border border-green-100 animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-green-800">Check your inbox</h3>
                            <p className="text-gray-600 text-sm">
                                We've sent a password reset link to <strong>{email}</strong>.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Try another email
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 pl-4 text-base"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                )}

                <div className="text-center">
                    <a href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </a>
                </div>

            </div>
        </div>
    );
}
