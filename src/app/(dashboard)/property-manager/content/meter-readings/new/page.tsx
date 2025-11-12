//app/(dashboard)/property-manager/content/meter-readings/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Loader2, Calculator, AlertCircle } from "lucide-react";
import Link from "next/link";

interface LeaseUtility {
  id: string;
  Lease: {
    id: string;
    tenant?: { name: string };
    unit?: { number: string };
    property?: { name: string };
    application?: { id: string };
  };
  utility: { 
    id: string; 
    name: string; 
    unitPrice: number | null;
    type: "FIXED" | "METERED";
  };
}


export default function NewMeterReadingPage() {
  const router = useRouter();
  const [leaseUtilities, setLeaseUtilities] = useState<LeaseUtility[]>([]);
  const [selectedLU, setSelectedLU] = useState<string>("");
  const [readingValue, setReadingValue] = useState<string>("");
  const [amount, setAmount] = useState<number | null>(null);
  
  const [isLoadingUtilities, setIsLoadingUtilities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lease utilities
  useEffect(() => {
    loadLeaseUtilities();
  }, []);

  const loadLeaseUtilities = async () => {
    try {
      setIsLoadingUtilities(true);
      setError(null);
      const res = await fetch("/api/lease-utility");
      const data = await res.json();
      
      if (data.success) {
        // Filter only METERED utilities
        const meteredUtilities = (data.data || []).filter(
          (lu: LeaseUtility) => lu.utility.type === "METERED"
        );
        setLeaseUtilities(meteredUtilities);
        
        if (meteredUtilities.length === 0) {
          setError("No metered utilities found. Please assign metered utilities to leases first.");
        }
      } else {
        setError(data.error || "Failed to load utilities");
        toast.error("Failed to load utilities");
      }
    } catch (err) {
      setError("An error occurred while loading utilities");
      toast.error("Failed to load utilities");
    } finally {
      setIsLoadingUtilities(false);
    }
  };

  // Calculate estimated amount
  useEffect(() => {
    const lu = leaseUtilities.find((l) => l.id === selectedLU);
    const value = parseFloat(readingValue);
    
    if (lu && lu.utility.unitPrice && value > 0) {
      setAmount(value * lu.utility.unitPrice);
    } else {
      setAmount(null);
    }
  }, [selectedLU, readingValue, leaseUtilities]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedLU) {
      toast.error("Please select a lease utility");
      return;
    }

    const value = parseFloat(readingValue);
    if (!readingValue || isNaN(value) || value <= 0) {
      toast.error("Please enter a valid reading value greater than 0");
      return;
    }

    if (amount === null) {
      toast.error("Unable to calculate amount. Please check the unit price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/utility-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lease_utility_id: selectedLU,
          reading_value: value,
          amount,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Meter reading added successfully!");
        setTimeout(() => {
          router.push("/property-manager/content/meter-readings");
        }, 1000);
      } else {
        toast.error(data.error || "Failed to add reading");
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error("An error occurred while submitting the reading");
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const selectedUtility = leaseUtilities.find((lu) => lu.id === selectedLU);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Toaster position="top-right" richColors />

      <div className="flex items-center gap-4">
        <Link href="/property-manager/content/meter-readings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Readings
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Add Meter Reading</h1>
        <p className="text-gray-500 mt-1">Record a new utility meter reading</p>
      </div>

      {isLoadingUtilities ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Loading utilities...</span>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-500 text-center">{error}</p>
            <div className="flex gap-3">
              <Button onClick={loadLeaseUtilities} variant="outline">
                Try Again
              </Button>
              <Link href="/property-manager/content/utilities">
                <Button>Go to Utilities</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>New Utility Reading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lease-utility">Select Lease Utility *</Label>
              <Select 
                value={selectedLU} 
                onValueChange={setSelectedLU}
                disabled={isSubmitting}
              >
                <SelectTrigger id="lease-utility">
                  <SelectValue placeholder="Choose a metered utility assignment" />
                </SelectTrigger>
                <SelectContent>
                {leaseUtilities.map((lu) => (
                    <SelectItem key={lu.id} value={lu.id}>
                    <div className="flex flex-col">
                        <span className="font-medium">{lu.utility.name}</span>
                        <span className="text-xs text-gray-500">
                        Tenant: {lu.Lease?.tenant?.name || "Unknown"} • 
                        Unit: {lu.Lease?.unit?.number || "N/A"} • 
                        Property: {lu.Lease?.property?.name || "N/A"} • 
                        Lease ID: {lu.Lease?.id.slice(0, 8)} • 
                        Rate: {formatCurrency(lu.utility.unitPrice || 0)}/unit
                        </span>
                    </div>
                    </SelectItem>
                ))}
                </SelectContent>


              </Select>
              {selectedUtility && (
                <p className="text-sm text-gray-500">
                  Unit price: {formatCurrency(selectedUtility.utility.unitPrice || 0)} per unit
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-value">Reading Value (units) *</Label>
              <Input
                id="reading-value"
                type="number"
                step="0.01"
                min="0"
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                placeholder="e.g., 45.6"
                disabled={isSubmitting}
                required
              />
              <p className="text-sm text-gray-500">
                Enter the current meter reading in units (kWh, gallons, etc.)
              </p>
            </div>

            {selectedLU && readingValue && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <Label className="text-blue-900">Calculated Amount</Label>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {amount ? formatCurrency(amount) : "—"}
                </p>
                {amount && selectedUtility && (
                  <p className="text-sm text-blue-700 mt-1">
                    {readingValue} units × {formatCurrency(selectedUtility.utility.unitPrice || 0)}/unit
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !selectedLU || !readingValue}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Reading"
                )}
              </Button>
              <Link href="/property-manager/content/meter-readings" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}