'use client'
import { useSearchParams } from 'next/navigation';

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'home';

  return <div>Current tab: {tab}</div>;
}
