'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ALLOWED_TABS = ['home', 'users', 'settings', 'reports'] as const;
type AdminTab = (typeof ALLOWED_TABS)[number];

function isAdminTab(value: string | null): value is AdminTab {
  return value !== null && (ALLOWED_TABS as readonly string[]).includes(value);
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');

  const tab: AdminTab = isAdminTab(rawTab) ? rawTab : 'home';

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">Current tab: {tab}</p>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4" role="status" aria-live="polite" aria-busy="true">
          Loading dashboard...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
