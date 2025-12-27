'use client';

import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

interface SignUpPageContentProps {
  role?: "PROPERTY_MANAGER" | "TENANT";
}

const SignupPageContent = ({ role: propRole }: SignUpPageContentProps) => {
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
    role: propRole || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentRole = propRole || formData.role;

  // If propRole is provided, set the role in formData and hide role selection
  useEffect(() => {
    if (propRole) {
      setFormData(prev => ({ ...prev, role: propRole }));
    }
  }, [propRole]);

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
    // Only require organization name for Property Managers
    if (currentRole === "PROPERTY_MANAGER" && !formData.organizationName.trim())
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

    if (!currentRole)
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
      // Use currentRole for the request
      const requestBody: Record<string, unknown> = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: currentRole,
      };

      // Only include organizationName for Property Managers
      if (currentRole === "PROPERTY_MANAGER") {
        requestBody.organizationName = formData.organizationName;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
          {propRole === "TENANT" ? "Join your community" : "Join thousands of property managers"}
        </p>
      </div>

      {isSuccess ? (
        <div className="flex flex-col items-center justify-center space-y-6 text-center py-10">
          {/* Email Icon Circle */}
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-8 h-8 text-blue-600"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
          </div>

          <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <p className="text-gray-500 max-w-xs mx-auto">
                We have sent a verification link to <span className="font-semibold text-gray-900">{formData.email}</span>.
              </p>
              <p className="text-sm text-gray-400">
                Please check your inbox to verify your account before logging in.
              </p>
          </div>

          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline mt-4 block">
            &larr; Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Company Name */}
          {currentRole === "PROPERTY_MANAGER" && (
            <Input
              type="text"
              name="organizationName"
              placeholder="Company Name *"
              value={formData.organizationName}
              onChange={handleInputChange}
              required
              className="h-12 text-base bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#003b73] focus:ring-2 focus:ring-[#003b73]/20 transition-all"
            />
          )}

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
          {!propRole && (
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
                  <SelectItem value="TENANT" className="focus:bg-[#003b73] focus:text-white cursor-pointer py-2.5 transition-colors">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
