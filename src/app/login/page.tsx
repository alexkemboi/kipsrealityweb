import { Link } from "lucide-react";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#021526] p-4">
      <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Left side illustration */}
        <div className="md:w-1/2 flex items-center justify-center  p-8">
          <img
            src="/loginillustrations.svg"
            alt="login Illustration"
            className="w-3/4 max-w-sm"
          />
        </div>

        {/* Right side form */}
        <div className="md:w-1/2 flex flex-col justify-center p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back 👋</h2>
          <p className="text-gray-500 mb-6">
            Login to continue managing your properties efficiently.
          </p>

          <form className="space-y-5">
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

            <a href="/dashboard" className="text-indigo-600 hover:underline">
              {/* <button

                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-300"
              >
                Sign In
              </button> */}
              Sign In
            </a>


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
