'use client';

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  // ✅ Full Validation
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

  // ✅ Handle Submit
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

      // ✅ Detect duplicate company
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
    <div className="w-full p-6 lg:px-8 lg:py-6">
      <Logo />

      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Join thousands of property managers
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-4 bg-green-50 p-6 rounded-xl border border-green-100">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800">Check Your Email</h3>
          <p className="text-gray-600">
            We've sent a verification link to <strong>{formData.email}</strong>.
            Please check your inbox to verify your account before logging in.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
          >
            Proceed to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Company Name */}
          <Input
            type="text"
            name="organizationName"
            placeholder="Company Name *"
            value={formData.organizationName}
            onChange={handleInputChange}
            required
            className="h-12 text-base"
          />

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />
            <Input
              type="text"
              name="lastName"
              placeholder="Last Name *"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />

          <Input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="h-12 text-base"
          />
        </div>

         {/* role in dropdown*/}
         <div>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            className="w-full h-12 border rounded px-3 text-base text-gray-700"
          >
            <option value="">Select Role </option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="PROPERTY_MANAGER">Property Manager</option>
            <option value="VENDOR">Vendor</option>
            <option value="AGENT">Agent</option>
            <option value="TENANT">Tenant</option>
            <option value="LANDLORD">Landlord</option>
          </select>
        </div>

            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="h-12 text-base"
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password *"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-12 text-base pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="h-12 text-base pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
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
      )}

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline font-semibold">
          Sign in
        </a>
      </p>
    </div>
  );
};

export default SignupPageContent;
