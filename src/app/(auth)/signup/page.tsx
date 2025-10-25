'use client'
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!formData.organizationName) {
      const errorMsg = "Company name is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (formData.password.length < 8) {
      const errorMsg = "Password must be at least 8 characters long";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          organizationName: formData.organizationName,
          phone: formData.phone
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Success toast
      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push('/property-manager');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 lg:p-8">
      <Logo />

      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Join thousands of property managers
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <Input
            type="text"
            name="organizationName"
            placeholder="Company Name *"
            value={formData.organizationName}
            onChange={handleInputChange}
            required
            className="h-12 text-base"
          />
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />
          </div>
          <div>
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
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />
          </div>
          <div>
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
        >
          {isLoading ? (
            "Creating Account..."
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline font-semibold">
          Sign in
        </a>
      </p>
    </div>
  );
};

export default SignupPage;