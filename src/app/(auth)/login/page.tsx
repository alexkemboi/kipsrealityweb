'use client'
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth()
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    if (!formData.email || !formData.password) {
      const errorMsg = "Please fill in all fields";
      setError(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        login(data.user, data.token);

        toast.success("Login successful! Redirecting...");
        
        switch (data.user.role) {
          case "SYSTEM_ADMIN":
            router.push("/admin");
            break;
          case "PROPERTY_MANAGER":
            router.push("/property-manager");
            break;
          case "TENANT":
            router.push("/tenant");
            break;
          case "VENDOR":
            router.push("/vendor");
            break;
          default:
            router.push("/");
        }

      } else {
        const err = await response.json();
        const errorMsg = err.error || "Invalid credentials";
        setError(errorMsg);
        toast.error(errorMsg, { duration: 4000 });
      }
    } catch (error) {
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 lg:p-8">
      <Logo />

      <div className="text-center mb-8">
        <p className="text-gray-600 text-sm lg:text-base">
          Sign in to manage your properties and access your dashboard
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Mail className="w-5 h-5" />
          </div>
          <Input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="h-12 pl-11 pr-4 text-base focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="h-12 pl-11 pr-12 text-base focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Forgot your password?
          </a>
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
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Signing In...
            </div>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors"
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;