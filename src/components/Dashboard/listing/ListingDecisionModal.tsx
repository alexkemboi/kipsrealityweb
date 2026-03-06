'use client'

import React, { useState } from 'react'
import { Building2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnitWithListingStatus } from '@/lib/listing-types'

interface ListingDecisionModalProps {
  isOpen: boolean
  onClose: () => void
  unit: UnitWithListingStatus
  onDecision: (unitId: string, decision: 'list' | 'private') => Promise<void>
}

export default function ListingDecisionModal({
  isOpen,
  onClose,
  unit,
  onDecision,
}: ListingDecisionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDecision = async (decision: 'list' | 'private') => {
    setIsProcessing(true)
    setError(null)
    
    try {
      await onDecision(unit.id, decision)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your decision')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Marketplace Listing Decision
          </DialogTitle>
          <DialogDescription>
            Choose how you want to handle this unit's marketplace visibility.
          </DialogDescription>
        </DialogHeader>

        {/* Unit Details Card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Unit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Unit Number:</span>
                <p className="text-slate-900">{unit.unitNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Rent Amount:</span>
                <p className="text-slate-900">{formatCurrency(unit.rentAmount)}</p>
              </div>
              {unit.bedrooms && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Bedrooms:</span>
                  <p className="text-slate-900">{unit.bedrooms}</p>
                </div>
              )}
              {unit.bathrooms && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Bathrooms:</span>
                  <p className="text-slate-900">{unit.bathrooms}</p>
                </div>
              )}
              {unit.squareFootage && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Square Footage:</span>
                  <p className="text-slate-900">{unit.squareFootage} sq ft</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Decision Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Choose an Option</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* List on Marketplace Option */}
            <Card className="border-2 border-green-200 hover:border-green-300 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">List on Marketplace</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Make this unit publicly visible to potential tenants. They can view details and submit applications.
                    </p>
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>✓ Unit appears in marketplace searches</p>
                      <p>✓ Tenants can submit applications</p>
                      <p>✓ Increased visibility and inquiries</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleDecision('list')}
                  disabled={isProcessing}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Processing...' : 'List on Marketplace'}
                </Button>
              </CardContent>
            </Card>

            {/* Keep Private Option */}
            <Card className="border-2 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-slate-200 transition-colors">
                    <EyeOff className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">Keep Private</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Keep this unit private for now. You can list it on the marketplace later when ready.
                    </p>
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>✓ Unit remains in your dashboard</p>
                      <p>✓ No public visibility</p>
                      <p>✓ Can be listed later</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleDecision('private')}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {isProcessing ? 'Processing...' : 'Keep Private'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p>
            <strong>Note:</strong> You can change this decision at any time from your unit management dashboard. 
            Private units can be listed later, and listed units can be removed from the marketplace.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Named export for compatibility
export { ListingDecisionModal }