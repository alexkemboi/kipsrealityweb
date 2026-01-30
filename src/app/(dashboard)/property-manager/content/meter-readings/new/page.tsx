"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Calculator,
  AlertCircle,
  Zap,
  Building2,
  User,
  DollarSign,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface LeaseUtility {
  id: string;
  Lease: {
    id: string;
    tenant?: { firstName?: string; lastName?: string; email?: string } | null;
    unit?: { number?: string; unitNumber?: string } | null;
    property?: { name?: string; address?: string } | null;
  };
  utility: { id: string; name: string; unitPrice: number | null; type: "FIXED" | "METERED" };
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

  const [readingsMap, setReadingsMap] = useState<{
    [leaseUtilityId: string]: { initial: number | null; previous: number | null };
  }>({});

  const [consumption, setConsumption] = useState<number | null>(null);

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
        const metered = (data.data || []).filter((lu: LeaseUtility) => lu.utility.type === "METERED");
        setLeaseUtilities(metered);
        if (metered.length === 0) {
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

  const selectedUtility = leaseUtilities.find((lu) => lu.id === selectedLU);
  const selectedReadings = readingsMap[selectedLU] || { initial: null, previous: null };
  const { initial: initialReading, previous: previousReading } = selectedReadings;

  // Fetch readings per lease utility
  useEffect(() => {
    const fetchReadings = async () => {
      if (!selectedLU) return;
      try {
        const res = await fetch(`/api/utility-readings?leaseUtilityId=${selectedLU}`);
        const data = await res.json();
        if (data.success) {
          const readings = (data.data || []).sort(
            (a: any, b: any) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
          );

          const initial = readings.length ? readings[0].readingValue : null;
          const previous =
            readings.length > 1 ? readings[readings.length - 1].readingValue : readings[0]?.readingValue || 0;

          setReadingsMap((prev) => ({
            ...prev,
            [selectedLU]: { initial, previous },
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchReadings();
  }, [selectedLU]);

  // Calculate consumption
  useEffect(() => {
    const current = parseFloat(readingValue);
    if (!isNaN(current) && previousReading !== null) {
      const cons = current - previousReading;
      setConsumption(cons >= 0 ? cons : null);
    } else setConsumption(null);
  }, [readingValue, previousReading]);

  // Calculate amount
  useEffect(() => {
    if (selectedUtility && selectedUtility.utility.unitPrice && consumption !== null) {
      setAmount(consumption * selectedUtility.utility.unitPrice);
    } else {
      setAmount(null);
    }
  }, [selectedUtility, consumption]);

  const handleSubmit = async () => {
    if (!selectedLU) return toast.error("Please select a lease utility");
    const value = parseFloat(readingValue);
    if (!readingValue || isNaN(value) || value <= 0)
      return toast.error("Please enter a valid reading value greater than 0");
    if (previousReading !== null && value < previousReading)
      return toast.error("Current reading cannot be less than the previous reading");
    if (amount === null) return toast.error("Unable to calculate amount");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/utility-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseUtilityId: selectedLU,
          readingValue: value,
          amount,
          readingDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meter reading added successfully!");
        setTimeout(() => router.push("/property-manager/content/meter-readings"), 1000);
      } else {
        toast.error(data.error || "Failed to add reading");
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error("An error occurred while submitting the reading");
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b1f3a] via-[#15386a] to-[#0b1f3a] text-white shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link href="/property-manager/content/meter-readings">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 mb-6 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Readings
            </Button>
          </Link>
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-[#30D5C8] to-[#28bfb3] p-4 rounded-2xl shadow-lg">
              <Zap className="w-10 h-10 text-[#0b1f3a]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Add Meter Reading</h1>
              <p className="text-blue-200 text-lg">Record a new utility meter reading for accurate billing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {isLoadingUtilities ? (
          <Card className="border-none shadow-2xl">
            <CardContent className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin text-[#30D5C8] mx-auto mb-6" />
                <span className="text-gray-600 text-xl font-medium">Loading utilities...</span>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8">
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                <div className="bg-white p-5 rounded-full shadow-lg">
                  <AlertCircle className="w-16 h-16 text-red-600" />
                </div>
                <div className="text-center max-w-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Utilities</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{error}</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={loadLeaseUtilities} variant="outline" className="border-2 border-red-200 hover:bg-red-50 h-12 px-6">
                    <TrendingUp className="w-4 h-4 mr-2" /> Try Again
                  </Button>
                  <Link href="/property-manager/content/utilities">
                    <Button className="bg-[#0b1f3a] hover:bg-[#15386a] h-12 px-6">
                      <Zap className="w-4 h-4 mr-2" /> Go to Utilities
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-3">
              <Card className="border-none shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white pb-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <Calculator className="w-7 h-7" />
                    </div>
                    New Meter Reading
                  </CardTitle>
                  <p className="text-blue-200 mt-2 text-sm">Complete the form to record usage</p>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Lease Utility Selector */}
                  <div className="space-y-4">
                    <Label htmlFor="lease-utility" className="text-[#0b1f3a] font-bold text-lg flex items-center gap-2">
                      <div className="bg-[#30D5C8]/10 p-1.5 rounded">
                        <Zap className="w-5 h-5 text-[#30D5C8]" />
                      </div>
                      Select Lease Utility <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedLU} onValueChange={(val) => { setSelectedLU(val); setReadingValue(""); }}>
                      <SelectTrigger
                        id="lease-utility"
                        className="h-14 border-2 border-gray-300 hover:border-[#30D5C8] focus:border-[#30D5C8] transition-colors text-base bg-white shadow-sm"
                      >
                        <SelectValue placeholder="Choose a metered utility assignment..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-[400px] overflow-y-auto border-2 border-gray-200 shadow-xl">
                        {leaseUtilities.map((lu) => {
                          const tenant = lu.Lease?.tenant;
                          const property = lu.Lease?.property;
                          const unit = lu.Lease?.unit;
                          const tenantName =
                            tenant?.firstName || tenant?.lastName
                              ? `${tenant?.firstName ?? ""} ${tenant?.lastName ?? ""}`.trim()
                              : "Unknown Tenant";
                          return (
                            <SelectItem key={lu.id} value={lu.id} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 border-b border-gray-100 last:border-0">
                              <div className="py-3 px-2">
                                <div className="font-bold text-[#0b1f3a] text-base mb-2 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-[#30D5C8]" />
                                  {lu.utility.name}
                                </div>
                                <div className="space-y-1.5 ml-6">
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <User className="w-4 h-4 text-[#30D5C8]" />
                                    <span className="font-medium">{tenantName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Building2 className="w-4 h-4 text-[#30D5C8]" />
                                    <span>Unit: {unit?.unitNumber || unit?.number || "N/A"} • {property?.name || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                    <span className="font-semibold text-emerald-600">
                                      {formatCurrency(lu.utility.unitPrice || 0)}/unit
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Initial, Previous & Consumption */}
                  {selectedLU && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm space-y-2">
                      <p className="text-sm text-gray-600">Initial Reading: <span className="font-bold">{initialReading ?? "—"}</span> units</p>
                      <p className="text-sm text-gray-600">Previous Reading: <span className="font-bold">{previousReading ?? "—"}</span> units</p>
                      <p className="text-sm text-gray-600">Consumption: <span className="font-bold">{consumption ?? "—"}</span> units</p>
                    </div>
                  )}

                  {/* Reading Input */}
                  <div className="space-y-4">
                    <Label htmlFor="reading-value" className="text-[#0b1f3a] font-bold text-lg flex items-center gap-2">
                      <div className="bg-[#30D5C8]/10 p-1.5 rounded">
                        <TrendingUp className="w-5 h-5 text-[#30D5C8]" />
                      </div>
                      Reading Value (units) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="reading-value"
                      type="number"
                      step="0.01"
                      min={previousReading || 0}
                      value={readingValue}
                      onChange={(e) => setReadingValue(e.target.value)}
                      placeholder="Enter meter reading (e.g., 45.6)"
                      disabled={isSubmitting}
                      className="h-14 border-2 border-gray-300 hover:border-[#30D5C8] focus:border-[#30D5C8] transition-colors text-lg bg-white shadow-sm"
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedLU || !readingValue}
                      className="flex-1 h-14 bg-gradient-to-r from-[#30D5C8] to-[#28bfb3] hover:from-[#28bfb3] hover:to-[#30D5C8] text-[#0b1f3a] font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Submit Reading
                        </>
                      )}
                    </Button>
                    <Link href="/property-manager/content/meter-readings" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-14 border-2 hover:bg-gray-50 font-semibold text-base"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with live calculation */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <Card className="border-none shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-[#30D5C8] via-[#28bfb3] to-[#30D5C8] text-white">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-white text-xl">
                        <Calculator className="w-6 h-6" />
                        Live Calculation
                      </CardTitle>
                      <p className="text-white/80 text-sm">Your reading breakdown</p>
                    </CardHeader>
                    <CardContent className="pb-8">
                      {selectedLU && readingValue ? (
                        <div className="space-y-4">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                            <p className="text-sm text-gray-600 font-medium mb-2">Current Reading</p>
                            <p className="text-3xl font-bold text-[#0b1f3a] flex items-baseline gap-2">
                              {readingValue} <span className="text-base font-normal text-gray-600">units</span>
                            </p>
                          </div>

                          {selectedUtility && (
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                              <p className="text-sm text-gray-600 font-medium mb-2">Unit Price</p>
                              <p className="text-2xl font-bold text-[#0b1f3a]">
                                {formatCurrency(selectedUtility.utility.unitPrice || 0)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">per unit</p>
                            </div>
                          )}

                          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                            <p className="text-sm text-gray-600 font-medium mb-2">Consumption</p>
                            <p className="text-3xl font-bold text-[#0b1f3a]">{consumption !== null ? consumption : "—"} units</p>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl blur-xl opacity-50"></div>
                            <div className="relative bg-white rounded-xl p-6 shadow-2xl border-2 border-emerald-200">
                              <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                <p className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Total Amount</p>
                              </div>
                              <p className="text-4xl font-bold text-emerald-600 mb-2">
                                {amount ? formatCurrency(amount) : "—"}
                              </p>
                              {amount && selectedUtility && (
                                <div className="bg-emerald-50 rounded-lg p-3 mt-3">
                                  <p className="text-xs text-emerald-800 font-medium">
                                    {consumption} units × {formatCurrency(selectedUtility.utility.unitPrice || 0)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Calculator className="w-10 h-10" />
                          </div>
                          <p className="text-white/90 leading-relaxed px-4">
                            Select a utility and enter a reading value to see the calculated amount
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
