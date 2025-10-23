// "use client"
// import React from "react";
// import Dashboard from "@/components/Dashboard/propertymanagerdash/dashboard";
// import Layout from "@/components/Dashboard/propertymanagerdash/layout";

// const DashboardPage = () => {
//   return (
//     <div className="bg-[#0f172a] h-full">
//       <Layout>
//         <Dashboard />
//       </Layout>
//     </div>
//   );
// };

// export default DashboardPage;

// src/app/(dashboard)/property-manager/page.tsx
// src/app/(dashboard)/property-manager/page.tsx
export default function PropertyManagerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Property Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">My Properties</h3>
          <p className="text-gray-600 mt-2">Manage your property portfolio</p>
        </div>
        {/* More property manager content */}
      </div>
    </div>
  )
}