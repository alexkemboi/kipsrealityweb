// src/app/(dashboard)/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">User Management</h3>
          <p className="text-gray-600 mt-2">Manage all users in the system</p>
        </div>
      </div>
    </div>
  )
}