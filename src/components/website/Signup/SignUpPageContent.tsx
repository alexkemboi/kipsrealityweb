'use client';

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignupPageContent = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    phone: "",
    role: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ Input Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  //Full Validation
  const validateForm = () => {
    if (!formData.organizationName.trim())
      return "Company name is required";

    if (!formData.firstName.trim())
      return "First name is required";

    if (!formData.lastName.trim())
      return "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return "Please enter a valid email address";

    const phoneRegex = /^[0-9+\-\s]{7,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone))
      return "Invalid phone number format";

    if (formData.password.length < 8)
      return "Password must be at least 8 characters long";

    const strongPasswordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;

    if (!strongPasswordRegex.test(formData.password))
      return "Password must include uppercase, lowercase, number, and symbol";

    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";

    if (!formData.role)
      return "Please select your role";

    return null;
  };

  //Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          organizationName: formData.organizationName,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      const result = await response.json();

      // Detect duplicate company
      if (!response.ok) {
        if (
          result.error === "ORGANIZATION_EXISTS" ||
          result.error?.toLowerCase().includes("company") ||
          result.error?.toLowerCase().includes("organization")
        ) {
          const msg = "A company with this name already exists";
          setError(msg);
          toast.error(msg);
          return;
        }

        throw new Error(result.error || "Registration failed");
      }

      setIsSuccess(true);
      toast.success("Account created successfully! Please check your email.");

      // Removed auto-redirect

    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-8 lg:px-12 lg:py-4">
      <Logo className="w-28 h-28" />

      <div className="text-center mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-neutral-500 text-sm lg:text-base">
          Join thousands of property managers
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-4 bg-navy-50 p-6 rounded-xl border border-green-100">
          <div className="mx-auto w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-[#003b73]" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">Check Your Email</h3>
          <p className="text-neutral-600">
            We've sent a verification link to <strong className="text-neutral-900">{formData.email}</strong>.
            Please check your inbox to verify your account before logging in.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full mt-4 bg-navy-700 hover:bg-navy-800 text-white"
          >
            Proceed to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Company Name */}
          <Input
            type="text"
            name="organizationName"
            placeholder="Company Name *"
            value={formData.organizationName}
            onChange={handleInputChange}
            required
            className="h-12 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
          />

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="h-12 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
            />
            <Input
              type="text"
              name="lastName"
              placeholder="Last Name *"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="h-12 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-12 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
            />

            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="h-12 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
            />
          </div>

          {/* Role Selection */}
          <div>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="w-full h-12 border-neutral-200 bg-white text-neutral-900 focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all text-base px-3">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-neutral-200" side="bottom" sideOffset={4}>
                <SelectItem value="PROPERTY_MANAGER" className="focus:bg-[#003b73] focus:text-white cursor-pointer py-2.5 transition-colors">Property Manager</SelectItem>
                <SelectItem value="VENDOR" className="focus:bg-[#003b73] focus:text-white cursor-pointer py-2.5 transition-colors">Vendor</SelectItem>
                <SelectItem value="AGENT" className="focus:bg-[#003b73] focus:text-white cursor-pointer py-2.5 transition-colors">Agent</SelectItem>
                <SelectItem value="TENANT" className="focus:bg-[#003b73] focus:text-white cursor-pointer py-2.5 transition-colors">Tenant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password *"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-12 text-base pr-10 bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="h-12 text-base pr-10 bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Error Block */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#003b73] hover:bg-[#002b5b] text-white text-base font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      )
      }

      <p className="text-center text-sm text-neutral-500 mt-4 pt-4 border-t border-neutral-100">
        Already have an account?{" "}
        <a href="/login" className="text-neutral-600 hover:text-[#003b73] hover:underline font-semibold transition-colors">
          Sign in
        </a>
      </p>
    </div >
  );
};

export default SignupPageContent;
