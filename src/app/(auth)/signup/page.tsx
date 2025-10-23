'use client'
import React, { useState } from "react";
import { User, Building2, Home, Wrench } from "lucide-react";

const SignupPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const roles = [
    {
      id: "admin",
      title: "Admin / Property Manager",
      description: "Full access to manage all properties, tenants, and operations",
      icon: Building2,
      color: "bg-[#021526]",
      hoverColor: "hover:bg-[#03346E]",
    },
    {
      id: "landlord",
      title: "Landlord",
      description: "Manage your owned properties and view tenant information",
      icon: Home,
      color: "bg-[#03346E]",
      hoverColor: "hover:bg-[#021526]",
    },
    {
      id: "tenant",
      title: "Tenant",
      description: "View your lease and submit maintenance requests",
      icon: User,
      color: "bg-[#6EACDA]",
      hoverColor: "hover:bg-[#03346E]",
    },
    {
      id: "vendor",
      title: "Vendor / Contractor",
      description: "Access and manage assigned maintenance tickets",
      icon: Wrench,
      color: "bg-[#03346E]",
      hoverColor: "hover:bg-[#021526]",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#021526] via-[#03346E] to-[#021526] p-4">
      <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
        {/* Left side illustration */}
        <div className="md:w-2/5 bg-gradient-to-br from-[#6EACDA] to-[#03346E] flex items-center justify-center p-8">
          <div className="text-center">
            <img
              src="/signupillustration.svg"
              alt="Signup Illustration"
              className="w-full max-w-xs mx-auto mb-6"
            />
            <h3 className="text-white text-2xl font-bold mb-2">
              Welcome to PropertyPro
            </h3>
            <p className="text-white/90 text-sm">
              Streamline your property management experience
            </p>
          </div>
        </div>

        {/* Right side form */}
        <div className="md:w-3/5 flex flex-col justify-center p-8 md:p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-500 mb-6">
            Choose your role and start managing properties efficiently
          </p>

          <form className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                        selectedRole === role.id
                          ? "border-[#03346E] bg-[#6EACDA]/10"
                          : "border-gray-200 hover:border-[#6EACDA]"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mb-2 ${
                          selectedRole === role.id
                            ? "text-[#03346E]"
                            : "text-gray-400"
                        }`}
                      />
                      <div className="text-sm font-semibold text-gray-800">
                        {role.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {role.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional fields based on role */}
            {selectedRole && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                  />
                </div>

                {/* Conditional fields for specific roles */}
                {selectedRole === "landlord" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Number of Properties
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 5"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                    />
                  </div>
                )}

                {selectedRole === "vendor" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Company LLC"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                    />
                  </div>
                )}

                {selectedRole === "vendor" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Service Type
                    </label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none">
                      <option value="">Select service type</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC</option>
                      <option value="general">General Maintenance</option>
                      <option value="landscaping">Landscaping</option>
                      <option value="cleaning">Cleaning</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#03346E] outline-none"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 text-[#03346E] focus:ring-[#6EACDA] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-sm text-gray-600"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-[#03346E] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#03346E] hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#03346E] hover:bg-[#021526] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Account
                </button>
              </>
            )}

            {!selectedRole && (
              <div className="text-center py-8 text-gray-400">
                Please select your role to continue
              </div>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-[#03346E] hover:underline font-semibold">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;