// src/components/website/PropertyManager/PropertyCreationSuccessModal.tsx
'use client'

import React from 'react'
import { CheckCircle, BarChart3, Home, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PropertyCreationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string | null
  imageCount: number
  onViewPropertyAnalytics: (propertyId: string) => void
  onReturnToDashboard: () => void
  onAddAnotherProperty: () => void
}

export default function PropertyCreationSuccessModal({
  isOpen,
  onClose,
  propertyId,
  imageCount,
  onViewPropertyAnalytics,
  onReturnToDashboard,
  onAddAnotherProperty,
}: PropertyCreationSuccessModalProps) {
  const handleViewPropertyAnalytics = () => {
    if (propertyId) {
      onViewPropertyAnalytics(propertyId)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Property Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Your property has been registered{imageCount > 0 ? ` with ${imageCount} image${imageCount === 1 ? '' : 's'} uploaded` : ''}.
            What would you like to do next?
          </DialogDescription>
        </DialogHeader>

        <Card className="border border-gray-200 shadow-none">
          <CardContent className="p-6 space-y-4">
            {/* Option 1: View Property Analytics */}
            <Button
              onClick={handleViewPropertyAnalytics}
              className="w-full h-auto py-4 px-6 justify-start text-left"
              variant="outline"
              disabled={!propertyId}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">View Property Analytics</div>
                  <div className="text-sm text-gray-500">
                    See detailed analytics and charts for this property
                  </div>
                </div>
              </div>
            </Button>

            {/* Option 2: Return to Dashboard */}
            <Button
              onClick={onReturnToDashboard}
              className="w-full h-auto py-4 px-6 justify-start text-left"
              variant="outline"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Return to Dashboard</div>
                  <div className="text-sm text-gray-500">
                    Go back to your main property manager dashboard
                  </div>
                </div>
              </div>
            </Button>

            {/* Option 3: Add Another Property */}
            <Button
              onClick={onAddAnotherProperty}
              className="w-full h-auto py-4 px-6 justify-start text-left"
              variant="outline"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Add Another Property</div>
                  <div className="text-sm text-gray-500">
                    Register another property to your portfolio
                  </div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            You can always access this property from your dashboard later.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}