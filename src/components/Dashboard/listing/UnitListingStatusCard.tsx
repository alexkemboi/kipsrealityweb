'use client'

import React, { useState } from 'react'
import {
  EyeOff,
  PauseCircle,
  Rocket,
  MoreHorizontal,
  Building2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UnitWithListingStatus, ListingStatus } from '@/lib/listing-types'
import { cn } from '@/lib/utils'

interface UnitListingStatusCardProps {
  unit: UnitWithListingStatus
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onStatusChange: (unitId: string, newStatus: string) => Promise<void>
  onEdit?: () => void
  loading?: boolean
  showPerformanceMetrics?: boolean
  className?: string
}

export default function UnitListingStatusCard({
  unit,
  onStatusChange,
  loading = false,
  className = ''
}: UnitListingStatusCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (loading || isLoading) return
    setIsLoading(true)
    try {
      await onStatusChange(unit.id, newStatus)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'Not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const currentStatus = unit.listing?.status || ListingStatus.PRIVATE
  const isPrivate = currentStatus === ListingStatus.PRIVATE
  const displayRent = unit.rentAmount ?? unit.listing?.price

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm transition-all duration-200",
      isPrivate && "opacity-90",
      className
    )}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isPrivate
              ? "bg-slate-100 dark:bg-slate-700/50"
              : "bg-blue-50 dark:bg-blue-900/30"
          )}>
            <Building2 className={cn(
              "w-6 h-6",
              isPrivate
                ? "text-slate-400 dark:text-slate-500"
                : "text-blue-600 dark:text-blue-400"
            )} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Unit {unit.unitNumber}
            </h2>
            <div className="flex items-center mt-1">
              {isPrivate ? (
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Private
                </span>
              ) : (
                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Listed
                </span>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                {isPrivate ? "Not in marketplace" : "Visible in marketplace"}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { }}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => { }}>
              Delete Unit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isPrivate ? (
        /* Private State Content */
        <div className="py-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Unit is currently private</p>
          <button
            onClick={() => handleStatusChange(ListingStatus.ACTIVE)}
            disabled={isLoading}
            className="bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-6 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            List on Marketplace
          </button>
        </div>
      ) : (
        /* Listed State Content */
        <>
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-50 dark:border-slate-700/50">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Rent</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(displayRent)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Bedrooms</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{unit.bedrooms || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Bathrooms</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{unit.bathrooms || '-'}</p>
            </div>
          </div>

          <div className="py-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Listing Details</p>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Title</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {unit.listing?.title || `Unit ${unit.unitNumber} Listing`}
              </p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Listed Price</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(unit.listing?.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Listed Since</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(unit.listing?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleStatusChange(ListingStatus.PRIVATE)}
              disabled={isLoading}
              className="flex-1 border border-slate-200 dark:border-slate-700 py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4" />
              Remove
            </button>
            <button
              onClick={() => handleStatusChange(ListingStatus.SUSPENDED)}
              disabled={isLoading}
              className="flex-1 border border-slate-200 dark:border-slate-700 py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
            >
              <PauseCircle className="w-4 h-4 text-amber-500" />
              Suspend
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Named export for compatibility
export { UnitListingStatusCard }
