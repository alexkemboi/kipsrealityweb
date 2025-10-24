"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userRole = data.user.role;

        switch (userRole) {
          case "admin":
            router.push("/admin");
            break;
          case "property-manager":
            router.push("/property-manager");
            break;
          case "tenant":
            router.push("/tenant");
            break;
          case "vendor":
            router.push("/vendor");
            break;
          default:
            router.push("/");
        }
      } else {
        const err = await response.json();
        setErrorMsg(err.error || "Invalid credentials.");
      }
    } catch (error) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#021526] p-4">
      <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
        {/* Left side illustration */}
        <div className="md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
          <img
            src="/loginillustrations.svg"
            alt="Login Illustration"
            className="w-3/4 max-w-sm animate-fadeIn"
          />
        </div>

        {/* Right side form */}
        <div className="md:w-1/2 flex flex-col justify-center p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back 👋
          </h2>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don’t have an account?{" "}
              <a href="/signup" className="text-indigo-600 hover:underline">
                Sign up
              </a>
            </p>
          </form>

          {/* Demo Credentials Section */}
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Demo Credentials
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <strong>Admin:</strong> admin@kipsreality.com / admin123
              </li>
              <li>
                <strong>Manager:</strong> manager@kipsreality.com / manager123
              </li>
              <li>
                <strong>Tenant:</strong> tenant@kipsreality.com / tenant123
              </li>
              <li>
                <strong>Vendor:</strong> vendor@kipsreality.com / vendor123
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
