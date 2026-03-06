'use client'

import React, { useState, useCallback } from 'react'
import { 
  Eye, 
  EyeOff, 
  Pause, 
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Wrench,
  Play
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  UnitWithListingStatus, 
  ListingStatus, 
  BulkListingActionType,
  BulkListingOperation,
  BulkResult 
} from '@/lib/listing-types'

interface BulkListingActionsProps {
  units: UnitWithListingStatus[]
  onBulkAction: (operations: BulkListingOperation[]) => Promise<BulkResult>
  className?: string
  showUnitList?: boolean
}

interface BulkOperationProgress {
  isRunning: boolean
  currentOperation: number
  totalOperations: number
  currentUnitId?: string
  results?: BulkResult
}

interface ConfirmationDialogState {
  isOpen: boolean
  action?: BulkListingActionType
  selectedUnits: string[]
  title: string
  description: string
}

export default function BulkListingActions({
  units,
  onBulkAction,
  className = '',
  showUnitList = true
}: BulkListingActionsProps) {
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkOperationProgress>({
    isRunning: false,
    currentOperation: 0,
    totalOperations: 0
  })
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    selectedUnits: [],
    title: '',
    description: ''
  })
  const [error, setError] = useState<string | null>(null)

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedUnits.size === units.length) {
      setSelectedUnits(new Set())
    } else {
      setSelectedUnits(new Set(units.map(unit => unit.id)))
    }
  }, [units, selectedUnits.size])

  const handleSelectUnit = useCallback((unitId: string) => {
    const newSelection = new Set(selectedUnits)
    if (newSelection.has(unitId)) {
      newSelection.delete(unitId)
    } else {
      newSelection.add(unitId)
    }
    setSelectedUnits(newSelection)
  }, [selectedUnits])

  // Get available actions for selected units
  const getAvailableActions = useCallback(() => {
    if (selectedUnits.size === 0) return []

    const selectedUnitData = units.filter(unit => selectedUnits.has(unit.id))
    const actions: Array<{
      type: BulkListingActionType
      label: string
      icon: React.ComponentType<any>
      description: string
      eligibleCount: number
    }> = []

    // Count units eligible for each action
    const privateUnits = selectedUnitData.filter(unit => 
      !unit.listing || unit.listing.status === ListingStatus.PRIVATE
    ).length

    const activeUnits = selectedUnitData.filter(unit => 
      unit.listing?.status === ListingStatus.ACTIVE
    ).length

    const suspendedUnits = selectedUnitData.filter(unit => 
      unit.listing?.status === ListingStatus.SUSPENDED
    ).length

    const maintenanceUnits = selectedUnitData.filter(unit => 
      unit.listing?.status === ListingStatus.MAINTENANCE
    ).length

    if (privateUnits > 0) {
      actions.push({
        type: BulkListingActionType.LIST,
        label: 'List on Marketplace',
        icon: Eye,
        description: `List ${privateUnits} private unit${privateUnits !== 1 ? 's' : ''} on marketplace`,
        eligibleCount: privateUnits
      })
    }

    if (activeUnits > 0 || suspendedUnits > 0) {
      actions.push({
        type: BulkListingActionType.UNLIST,
        label: 'Remove from Marketplace',
        icon: EyeOff,
        description: `Remove ${activeUnits + suspendedUnits} unit${activeUnits + suspendedUnits !== 1 ? 's' : ''} from marketplace`,
        eligibleCount: activeUnits + suspendedUnits
      })
    }

    if (activeUnits > 0) {
      actions.push({
        type: BulkListingActionType.SUSPEND,
        label: 'Suspend Listings',
        icon: Pause,
        description: `Suspend ${activeUnits} active listing${activeUnits !== 1 ? 's' : ''}`,
        eligibleCount: activeUnits
      })
    }

    // Maintenance mode actions
    if (activeUnits > 0 || suspendedUnits > 0) {
      actions.push({
        type: BulkListingActionType.MAINTENANCE_START,
        label: 'Start Maintenance Mode',
        icon: Wrench,
        description: `Put ${activeUnits + suspendedUnits} unit${activeUnits + suspendedUnits !== 1 ? 's' : ''} into maintenance mode`,
        eligibleCount: activeUnits + suspendedUnits
      })
    }

    if (maintenanceUnits > 0) {
      actions.push({
        type: BulkListingActionType.MAINTENANCE_END,
        label: 'End Maintenance Mode',
        icon: Play,
        description: `End maintenance mode for ${maintenanceUnits} unit${maintenanceUnits !== 1 ? 's' : ''}`,
        eligibleCount: maintenanceUnits
      })
    }

    return actions
  }, [selectedUnits, units])

  const getEligibleUnitIds = useCallback((action: BulkListingActionType) => {
    return units
      .filter(unit => {
        const currentStatus = unit.listing?.status || ListingStatus.PRIVATE
        switch (action) {
          case BulkListingActionType.LIST:
            return currentStatus === ListingStatus.PRIVATE
          case BulkListingActionType.UNLIST:
            return currentStatus === ListingStatus.ACTIVE || currentStatus === ListingStatus.SUSPENDED
          case BulkListingActionType.SUSPEND:
            return currentStatus === ListingStatus.ACTIVE
          case BulkListingActionType.MAINTENANCE_START:
            return currentStatus === ListingStatus.ACTIVE || currentStatus === ListingStatus.SUSPENDED
          case BulkListingActionType.MAINTENANCE_END:
            return currentStatus === ListingStatus.MAINTENANCE
          default:
            return false
        }
      })
      .map(unit => unit.id)
  }, [units])

  // Confirmation dialog handlers
  const handleActionClick = useCallback((action: BulkListingActionType) => {
    const actionConfig = getAvailableActions().find(a => a.type === action)
    if (!actionConfig) return

    setConfirmDialog({
      isOpen: true,
      action,
      selectedUnits: Array.from(selectedUnits),
      title: `Confirm ${actionConfig.label}`,
      description: actionConfig.description
    })
  }, [selectedUnits, getAvailableActions])

  const handleConfirmAction = useCallback(async () => {
    if (!confirmDialog.action) return

    const selectedUnitData = units.filter(unit => selectedUnits.has(unit.id))
    const operations: BulkListingOperation[] = []

    // Build operations based on action type and unit eligibility
    for (const unit of selectedUnitData) {
      const currentStatus = unit.listing?.status || ListingStatus.PRIVATE

      switch (confirmDialog.action) {
        case BulkListingActionType.LIST:
          if (currentStatus === ListingStatus.PRIVATE) {
            operations.push({
              unitId: unit.id,
              action: BulkListingActionType.LIST,
              listingData: {
                unitId: unit.id,
                title: `Unit ${unit.unitNumber}`,
                description: `${unit.bedrooms || 'N/A'} bedroom, ${unit.bathrooms || 'N/A'} bathroom unit`,
                price: unit.rentAmount || 0
              }
            })
          }
          break

        case BulkListingActionType.UNLIST:
          if (currentStatus === ListingStatus.ACTIVE || currentStatus === ListingStatus.SUSPENDED) {
            operations.push({
              unitId: unit.id,
              action: BulkListingActionType.UNLIST
            })
          }
          break

        case BulkListingActionType.SUSPEND:
          if (currentStatus === ListingStatus.ACTIVE) {
            operations.push({
              unitId: unit.id,
              action: BulkListingActionType.SUSPEND
            })
          }
          break

        case BulkListingActionType.MAINTENANCE_START:
          if (currentStatus === ListingStatus.ACTIVE || currentStatus === ListingStatus.SUSPENDED) {
            operations.push({
              unitId: unit.id,
              action: BulkListingActionType.MAINTENANCE_START,
              listingData: {
                unitId: unit.id,
                reason: 'Bulk maintenance operation'
              }
            })
          }
          break

        case BulkListingActionType.MAINTENANCE_END:
          if (currentStatus === ListingStatus.MAINTENANCE) {
            operations.push({
              unitId: unit.id,
              action: BulkListingActionType.MAINTENANCE_END
            })
          }
          break
      }
    }

    if (operations.length === 0) {
      setError('No eligible units found for this action')
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      return
    }

    // Start bulk operation
    setProgress({
      isRunning: true,
      currentOperation: 0,
      totalOperations: operations.length,
      results: undefined
    })
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    setError(null)

    try {
      // Simulate progress updates (in real implementation, this would come from the service)
      const progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          currentOperation: Math.min(prev.currentOperation + 1, prev.totalOperations)
        }))
      }, 100)

      const result = await onBulkAction(operations)
      
      clearInterval(progressInterval)
      
      setProgress({
        isRunning: false,
        currentOperation: operations.length,
        totalOperations: operations.length,
        results: result
      })

      // Clear selection after successful operation
      if (result.summary.succeeded > 0) {
        setSelectedUnits(new Set())
      }

    } catch (err) {
      setProgress({
        isRunning: false,
        currentOperation: 0,
        totalOperations: 0
      })
      setError(err instanceof Error ? err.message : 'Bulk operation failed')
    }
  }, [confirmDialog, selectedUnits, units, onBulkAction])

  const handleRunAllEligible = useCallback(async (action: BulkListingActionType) => {
    const eligibleUnitIds = getEligibleUnitIds(action)
    if (eligibleUnitIds.length === 0) {
      setError('No eligible units found for this action')
      return
    }

    const selectedUnitData = units.filter(unit => eligibleUnitIds.includes(unit.id))
    const operations: BulkListingOperation[] = selectedUnitData.map(unit => {
      switch (action) {
        case BulkListingActionType.LIST:
          return {
            unitId: unit.id,
            action,
            listingData: {
              unitId: unit.id,
              title: `Unit ${unit.unitNumber}`,
              description: `${unit.bedrooms || 'N/A'} bedroom, ${unit.bathrooms || 'N/A'} bathroom unit`,
              price: unit.rentAmount || 0
            }
          }
        case BulkListingActionType.MAINTENANCE_START:
          return {
            unitId: unit.id,
            action,
            listingData: {
              unitId: unit.id,
              reason: 'Bulk maintenance operation'
            }
          }
        default:
          return { unitId: unit.id, action }
      }
    })

    setProgress({
      isRunning: true,
      currentOperation: 0,
      totalOperations: operations.length,
      results: undefined
    })
    setError(null)

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          currentOperation: Math.min(prev.currentOperation + 1, prev.totalOperations)
        }))
      }, 100)

      const result = await onBulkAction(operations)
      clearInterval(progressInterval)

      setProgress({
        isRunning: false,
        currentOperation: operations.length,
        totalOperations: operations.length,
        results: result
      })
    } catch (err) {
      setProgress({
        isRunning: false,
        currentOperation: 0,
        totalOperations: 0
      })
      setError(err instanceof Error ? err.message : 'Bulk operation failed')
    }
  }, [getEligibleUnitIds, onBulkAction, units])

  // Export results
  const handleExportResults = useCallback(() => {
    if (!progress.results) return

    const csvContent = [
      'Unit ID,Unit Number,Status,Result,Error',
      ...progress.results.successful.map(unitId => {
        const unit = units.find(u => u.id === unitId)
        return `${unitId},${unit?.unitNumber || 'Unknown'},Success,Completed,`
      }),
      ...progress.results.failed.map(failure => {
        const unit = units.find(u => u.id === failure.unitId)
        return `${failure.unitId},${unit?.unitNumber || 'Unknown'},Failed,Error,"${failure.error}"`
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-listing-results-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [progress.results, units])

  // Retry failed operations
  const handleRetryFailed = useCallback(async () => {
    if (!progress.results?.failed.length) return

    const retryOperations: BulkListingOperation[] = progress.results.failed.map(failure => {
      const unit = units.find(u => u.id === failure.unitId)
      if (!unit) throw new Error(`Unit ${failure.unitId} not found`)

      return {
        unitId: failure.unitId,
        action: confirmDialog.action || BulkListingActionType.LIST,
        listingData: confirmDialog.action === BulkListingActionType.LIST ? {
          unitId: failure.unitId,
          title: `Unit ${unit.unitNumber}`,
          description: `${unit.bedrooms || 'N/A'} bedroom, ${unit.bathrooms || 'N/A'} bathroom unit`,
          price: unit.rentAmount || 0
        } : undefined
      }
    })

    setProgress({
      isRunning: true,
      currentOperation: 0,
      totalOperations: retryOperations.length,
      results: undefined
    })

    try {
      const result = await onBulkAction(retryOperations)
      setProgress({
        isRunning: false,
        currentOperation: retryOperations.length,
        totalOperations: retryOperations.length,
        results: result
      })
    } catch (err) {
      setProgress({
        isRunning: false,
        currentOperation: 0,
        totalOperations: 0
      })
      setError(err instanceof Error ? err.message : 'Retry operation failed')
    }
  }, [progress.results, units, confirmDialog.action, onBulkAction])

  const availableActions = getAvailableActions()
  const isAllSelected = selectedUnits.size === units.length && units.length > 0
  const isPartiallySelected = selectedUnits.size > 0 && selectedUnits.size < units.length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showUnitList && (
                <Checkbox
                  checked={isAllSelected ? true : isPartiallySelected ? "indeterminate" : false}
                  onCheckedChange={handleSelectAll}
                />
              )}
              <CardTitle className="text-lg">
                Bulk Listing Actions
                {showUnitList && selectedUnits.size > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedUnits.size} selected
                  </Badge>
                )}
              </CardTitle>
            </div>

            {(showUnitList ? availableActions.length > 0 : units.length > 0) && (
              <div className="flex gap-2">
                {!showUnitList && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleRunAllEligible(BulkListingActionType.LIST)}
                    disabled={progress.isRunning || getEligibleUnitIds(BulkListingActionType.LIST).length === 0}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    List All Private
                  </Button>
                )}
                {availableActions.slice(0, 2).map((action) => {
                  const ActionIcon = action.icon
                  return (
                    <Button
                      key={action.type}
                      variant={action.type === BulkListingActionType.LIST ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleActionClick(action.type)}
                      disabled={progress.isRunning}
                    >
                      <ActionIcon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  )
                })}
                
                {availableActions.length > 2 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={progress.isRunning}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableActions.slice(2).map((action) => {
                        const ActionIcon = action.icon
                        return (
                          <DropdownMenuItem
                            key={action.type}
                            onClick={() => handleActionClick(action.type)}
                          >
                            <ActionIcon className="h-4 w-4 mr-2" />
                            {action.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        {selectedUnits.size > 0 && (
          <CardContent>
            <div className="text-sm text-gray-600">
              {availableActions.map((action, index) => (
                <div key={action.type}>
                  {index > 0 && ' • '}
                  {action.description}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Unit Selection List */}
      {showUnitList && (
        <div className="grid gap-3">
          {units.map((unit) => {
            const isSelected = selectedUnits.has(unit.id)
            const currentStatus = unit.listing?.status || ListingStatus.PRIVATE
            
            return (
              <Card 
                key={unit.id} 
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectUnit(unit.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => {}} // Handled by card click
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Unit {unit.unitNumber}</h4>
                          <p className="text-sm text-gray-600">
                            {unit.bedrooms || 'N/A'} bed • {unit.bathrooms || 'N/A'} bath
                            {unit.rentAmount && ` • $${unit.rentAmount.toLocaleString()}/month`}
                          </p>
                        </div>
                        
                        <Badge 
                          variant={currentStatus === ListingStatus.ACTIVE ? "default" : "secondary"}
                        >
                          {currentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Progress Display */}
      {progress.isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Processing Bulk Operation</h4>
                <span className="text-sm text-gray-600">
                  {progress.currentOperation} of {progress.totalOperations}
                </span>
              </div>
              
              <Progress 
                value={(progress.currentOperation / progress.totalOperations) * 100} 
                className="w-full"
              />
              
              {progress.currentUnitId && (
                <p className="text-sm text-gray-600">
                  Processing unit: {progress.currentUnitId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {progress.results && !progress.isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {progress.results.summary.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              Bulk Operation Results
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{progress.results.summary.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{progress.results.summary.succeeded}</p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{progress.results.summary.failed}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>

            {progress.results.failed.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-red-700">Failed Operations:</h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {progress.results.failed.map((failure) => {
                    const unit = units.find(u => u.id === failure.unitId)
                    return (
                      <div key={failure.unitId} className="flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="font-medium">Unit {unit?.unitNumber || failure.unitId}:</span>
                        <span className="text-gray-600">{failure.error}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportResults}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
              
              {progress.results.failed.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryFailed}
                  disabled={progress.isRunning}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => 
        setConfirmDialog({ ...confirmDialog, isOpen: open })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
              <br /><br />
              This action will affect {confirmDialog.selectedUnits.length} unit{confirmDialog.selectedUnits.length !== 1 ? 's' : ''}. 
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
// Named export for compatibility
export { BulkListingActions }
