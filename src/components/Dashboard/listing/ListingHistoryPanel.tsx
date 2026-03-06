'use client'

import React, { useState, useEffect } from 'react'
import { 
  History, 
  Filter, 
  Download, 
  Search, 
  User, 
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ListingAuditEntry, ListingAction, ListingStatus } from '@/lib/listing-types'
import { auditService, AuditFilter } from '@/lib/audit-service'

interface ListingHistoryPanelProps {
  unitId?: string
  listingId?: string
  userId?: string
  className?: string
  showFilters?: boolean
  showExport?: boolean
  maxHeight?: string
}

interface FilterState {
  search: string
  action?: ListingAction
  status?: ListingStatus
  dateFrom?: string
  dateTo?: string
  userId?: string
}

export default function ListingHistoryPanel({
  unitId,
  listingId,
  userId,
  className = '',
  showFilters = true,
  showExport = true,
  maxHeight = '600px'
}: ListingHistoryPanelProps) {
  const [auditEntries, setAuditEntries] = useState<ListingAuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>({
    search: ''
  })
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const ITEMS_PER_PAGE = 20

  // Load audit entries
  const loadAuditEntries = async (reset = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const auditFilter: AuditFilter = {
        unitId,
        listingId,
        userId: filters.userId || userId,
        action: filters.action,
        status: filters.status,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        limit: ITEMS_PER_PAGE,
        offset: reset ? 0 : offset
      }

      const result = await auditService.getAuditTrail(auditFilter)
      
      if (reset) {
        setAuditEntries(result.entries)
        setOffset(ITEMS_PER_PAGE)
      } else {
        setAuditEntries(prev => [...prev, ...result.entries])
        setOffset(prev => prev + ITEMS_PER_PAGE)
      }
      
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit history')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and filter changes
  useEffect(() => {
    loadAuditEntries(true)
  }, [unitId, listingId, userId, filters])

  // Filter handlers
  const handleFilterChange = (key: keyof FilterState, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
    setOffset(0)
  }

  const clearFilters = () => {
    setFilters({ search: '' })
    setOffset(0)
  }

  // Export functionality
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true)
      
      const auditFilter: AuditFilter = {
        unitId,
        listingId,
        userId: filters.userId || userId,
        action: filters.action,
        status: filters.status,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
      }

      const exportData = await auditService.exportAuditData(auditFilter, {
        format,
        includeMetadata: true
      })

      // Create and download file
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `listing-audit-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  // Entry expansion
  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  // Get action configuration
  const getActionConfig = (action: ListingAction) => {
    switch (action) {
      case ListingAction.CREATE:
        return {
          label: 'Created',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        }
      case ListingAction.REMOVE:
        return {
          label: 'Removed',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        }
      case ListingAction.SUSPEND:
        return {
          label: 'Suspended',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Pause
        }
      case ListingAction.ACTIVATE:
        return {
          label: 'Activated',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Play
        }
      case ListingAction.UPDATE:
        return {
          label: 'Updated',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: FileText
        }
      case ListingAction.EXPIRE:
        return {
          label: 'Expired',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        }
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle
        }
    }
  }

  // Get status configuration
  const getStatusConfig = (status: ListingStatus) => {
    switch (status) {
      case ListingStatus.ACTIVE:
        return { label: 'Active', icon: Eye, color: 'text-green-600' }
      case ListingStatus.PRIVATE:
        return { label: 'Private', icon: EyeOff, color: 'text-gray-600' }
      case ListingStatus.SUSPENDED:
        return { label: 'Suspended', icon: Pause, color: 'text-yellow-600' }
      case ListingStatus.PENDING:
        return { label: 'Pending', icon: Clock, color: 'text-blue-600' }
      case ListingStatus.EXPIRED:
        return { label: 'Expired', icon: XCircle, color: 'text-red-600' }
      default:
        return { label: 'Unknown', icon: AlertCircle, color: 'text-gray-600' }
    }
  }

  // Format date and time
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date))
  }

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDateTime(date)
  }

  // Filter audit entries based on search
  const filteredEntries = auditEntries.filter(entry => {
    if (!filters.search) return true
    
    const searchLower = filters.search.toLowerCase()
    return (
      entry.reason?.toLowerCase().includes(searchLower) ||
      entry.action.toLowerCase().includes(searchLower) ||
      entry.newStatus.toLowerCase().includes(searchLower) ||
      entry.userId.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            <CardTitle>Listing History</CardTitle>
            {filteredEntries.length > 0 && (
              <Badge variant="secondary">{filteredEntries.length} entries</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isExporting || filteredEntries.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters</span>
              {(filters.action || filters.status || filters.dateFrom || filters.dateTo || filters.userId) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search entries..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filters.action ?? 'all'}
                onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {Object.values(ListingAction).map(action => (
                    <SelectItem key={action} value={action}>
                      {getActionConfig(action).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.status ?? 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(ListingStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {getStatusConfig(status).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Audit Entries */}
        <div 
          className="space-y-3 overflow-y-auto"
          style={{ maxHeight }}
        >
          {isLoading && auditEntries.length === 0 ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audit entries found</p>
              {(filters.search || filters.action || filters.status || filters.dateFrom || filters.dateTo) && (
                <Button variant="ghost" onClick={clearFilters} className="mt-2">
                  Clear filters to see all entries
                </Button>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const actionConfig = getActionConfig(entry.action)
              const statusConfig = getStatusConfig(entry.newStatus)
              const ActionIcon = actionConfig.icon
              const StatusIcon = statusConfig.icon
              const isExpanded = expandedEntries.has(entry.id)

              return (
                <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${actionConfig.color.replace('text-', 'bg-').replace('border-', '')}`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${actionConfig.color} border text-xs`}>
                          {actionConfig.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                          <span>{statusConfig.label}</span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-1">
                        {entry.reason || `Listing ${entry.action.toLowerCase()}`}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{entry.userId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(entry.timestamp)}</span>
                        </div>
                      </div>

                      {/* Status Transition */}
                      {entry.previousStatus && entry.previousStatus !== entry.newStatus && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span>Status changed from </span>
                          <span className="font-medium">{getStatusConfig(entry.previousStatus).label}</span>
                          <span> to </span>
                          <span className="font-medium">{statusConfig.label}</span>
                        </div>
                      )}

                      {/* Expandable Metadata */}
                      {entry.metadata && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEntryExpansion(entry.id)}
                            className="h-6 px-2 text-xs"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Hide details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Show details
                              </>
                            )}
                          </Button>
                          
                          {isExpanded && (
                            <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                              <pre className="whitespace-pre-wrap text-gray-700">
                                {JSON.stringify(entry.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => loadAuditEntries(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}

          {/* Loading More Indicator */}
          {isLoading && auditEntries.length > 0 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
// Named export for compatibility
export { ListingHistoryPanel }
