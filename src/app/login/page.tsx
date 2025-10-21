"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState("propertymanager");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Redirect based on selected role
    switch (role) {
      case "propertymanager":
        router.push("/dashboards/propertymanagerdashboard");
        break;
      case "landlord":
        router.push("/dashboards/landlorddashboard");
        break;
      case "tenant":
        router.push("/dashboards/tenantdashboard");
        break;
      case "vendor":
        router.push("/dashboards/vendordashboard");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#021526] p-4">
      <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Left side illustration */}
        <div className="md:w-1/2 flex items-center justify-center p-8">
          <img
            src="/loginillustrations.svg"
            alt="Login Illustration"
            className="w-3/4 max-w-sm"
          />
        </div>

        {/* Right side form */}
        <div className="md:w-1/2 flex flex-col justify-center p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back 👋</h2>
          <p className="text-gray-500 mb-6">
            Login to continue managing your properties efficiently.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Sign in as
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="propertymanager">Property Manager</option>
                <option value="landlord">Landlord</option>
                <option value="tenant">Tenant</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-300"
            >
              Sign In
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don’t have an account?{" "}
              <a href="/signup" className="text-indigo-600 hover:underline">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
