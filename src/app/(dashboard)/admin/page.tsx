'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ALLOWED_TABS = ['home', 'users', 'settings', 'reports'] as const;
type AdminTab = (typeof ALLOWED_TABS)[number];

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');

  const tab: AdminTab = ALLOWED_TABS.includes(rawTab as AdminTab)
    ? (rawTab as AdminTab)
    : 'home';

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
        <div className="p-4" role="status" aria-live="polite">
          Loading dashboard...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
