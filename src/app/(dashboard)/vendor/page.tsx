'use client'

import { useDashboard } from '@/context/DashboardContext'
import DashboardContent from '../../../components/Dashboard/vendordash/DashboardContent'

export default function VendorDashboardPage() {
  const { selected } = useDashboard()

  return <DashboardContent selected={selected} />
}