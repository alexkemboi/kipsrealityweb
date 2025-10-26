'use client'

import { useDashboard } from '@/context/DashboardContext'
import DashboardContent from '@/components/Dashboard/SystemadminDash/DashoardContent'

export default function AdminDashboardPage() {
  const { selected } = useDashboard()

  return <DashboardContent selected={selected} />
}
