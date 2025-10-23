// "use client";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";

// const LoginPage: React.FC = () => {
//   const router = useRouter();
//   const [role, setRole] = useState("propertymanager");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Redirect based on selected role
//     switch (role) {
//       case "propertymanager":
//         router.push("/dashboards/propertymanagerdashboard");
//         break;
//       case "landlord":
//         router.push("/dashboards/landlorddashboard");
//         break;
//       case "tenant":
//         router.push("/dashboards/tenantdashboard");
//         break;
//       case "vendor":
//         router.push("/dashboards/vendordashboard");
//         break;
//       default:
//         router.push("/");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#021526] p-4">
//       <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
//         {/* Left side illustration */}
//         <div className="md:w-1/2 flex items-center justify-center p-8">
//           <img
//             src="/loginillustrations.svg"
//             alt="Login Illustration"
//             className="w-3/4 max-w-sm"
//           />
//         </div>

//         {/* Right side form */}
//         <div className="md:w-1/2 flex flex-col justify-center p-10">
//           <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back 👋</h2>
//           <p className="text-gray-500 mb-6">
//             Login to continue managing your properties efficiently.
//           </p>

//           <form className="space-y-5" onSubmit={handleSubmit}>
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 placeholder="you@example.com"
//                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 placeholder="••••••••"
//                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
//               />
//             </div>

//             {/* Role Selector */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Sign in as
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
//               >
//                 <option value="propertymanager">Property Manager</option>
//                 <option value="landlord">Landlord</option>
//                 <option value="tenant">Tenant</option>
//                 <option value="vendor">Vendor</option>
//               </select>
//             </div>

//             <button
//               type="submit"
//               className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-300"
//             >
//               Sign In
//             </button>

//             <p className="text-center text-sm text-gray-500 mt-4">
//               Don’t have an account?{" "}
//               <a href="/signup" className="text-indigo-600 hover:underline">
//                 Sign up
//               </a>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// src/app/(auth)/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("daaaata", data);
        const userRole = data.user.role

        // Redirect directly to role-specific dashboard
        switch (userRole) {
          case 'admin':
            router.push('/admin')
            break
          case 'property-manager':
            router.push('/property-manager')
            break
          case 'tenant':
            router.push('/tenant')
            break
          case 'vendor':
            router.push('/vendor')
            break
          default:
            router.push('/')
        }
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      alert('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Demo Credentials:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Admin:</strong> admin@kipsreality.com / admin123</p>
            <p><strong>Manager:</strong> manager@kipsreality.com / manager123</p>
            <p><strong>Tenant:</strong> tenant@kipsreality.com / tenant123</p>
            <p><strong>Vendor:</strong> vendor@kipsreality.com / vendor123</p>
          </div>
        </div>
      </div>
    </div>
  )
}