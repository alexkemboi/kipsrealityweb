"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import {
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Calendar,
  FileText,
  TrendingUp,
  Zap,
  DollarSign
} from "lucide-react";
import Link from "next/link";

interface Reading {
  id: string;
  readingValue: number;
  amount: number | null;
  readingDate: string;
  createdAt: string;
  leaseUtility: {
    id: string;
    Lease: {
      id: string;
      tenantName: string;
      unitNumber: string;
      propertyName: string;
      // Keep these for backwards compatibility
      tenant?: {
        firstName?: string | null;
        lastName?: string | null;
      } | null;
      unit?: {
        unitNumber?: string | null;
        number?: string | null;
      } | null;
      property?: {
        name?: string | null;
      } | null;
    };
    utility: {
      id: string;
      name: string;
      type: "FIXED" | "METERED";
      unitPrice: number | null;
    };
  };
}

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
      if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = readings.filter((r) => {
          const tenantName = (r.leaseUtility.Lease.tenantName || "").toLowerCase();
          const propertyName = (r.leaseUtility.Lease.propertyName || "").toLowerCase();
          const unitNumber = (r.leaseUtility.Lease.unitNumber || "").toLowerCase();
          const utilityName = r.leaseUtility.utility.name.toLowerCase();
        return (
          tenantName.includes(searchLower) ||
          propertyName.includes(searchLower) ||
          unitNumber.includes(searchLower) ||
          utilityName.includes(searchLower)
        );
      });
      setFilteredReadings(filtered);
    } else {
      setFilteredReadings(readings);
    }
  }, [searchTerm, readings]);

  const loadReadings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/utility-readings");
      const data = await res.json();

      if (data.success) {
        const sorted = data.data.sort(
          (a: Reading, b: Reading) =>
            new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
        );
        setReadings(sorted);
        setFilteredReadings(sorted);
      } else {
        setError(data.error || "Failed to load readings");
        toast.error("Failed to load readings");
      }
    } catch (err) {
      console.error("Error loading readings:", err);
      setError("An error occurred while loading readings");
      toast.error("Failed to load readings");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) =>
    amount === null
      ? "—"
      : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTotalAmount = () =>
    filteredReadings.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <Link href="/property-manager/content/utilities">
                  <Button className="bg-[#0b1f3a] hover:bg-[#15386a] h-12 px-6">
                    <Zap className="w-4 h-4 mr-2" /> Go to Utilities
                  </Button>
                </Link>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Meter Readings</h1>
                <p className="text-blue-200 mt-1">
                  Track and manage utility usage for all leases
                </p>
              </div>
            </div>
            <Link href="/property-manager/content/meter-readings/new">
              <Button className="bg-[#30D5C8] hover:bg-[#28bfb3] text-[#0b1f3a] font-semibold h-12 px-6">
                <Plus className="mr-2 w-5 h-5" /> Add Reading
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Cards */}
        {!isLoading && !error && readings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-2">
                      Total Readings
                    </p>
                    <p className="text-4xl font-bold mb-1">
                      {filteredReadings.length}
                    </p>
                    <p className="text-blue-200 text-xs">
                      Recorded this period
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <FileText className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-2">
                      Total Amount
                    </p>
                    <p className="text-4xl font-bold mb-1">
                      {formatCurrency(getTotalAmount())}
                    </p>
                    <p className="text-emerald-200 text-xs">
                      From all readings
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-2">
                      Latest Reading
                    </p>
                    <p className="text-lg font-semibold mb-1">
                      {filteredReadings.length > 0
                        ? formatDate(filteredReadings[0].readingDate)
                        : "—"}
                    </p>
                    <p className="text-purple-200 text-xs">
                      Most recent entry
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Calendar className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Table Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                All Readings ({filteredReadings.length})
              </CardTitle>
              {readings.length > 0 && (
                <div className="relative md:max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by tenant, property, or utility..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-white/20 h-10"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#30D5C8] mx-auto mb-4" />
                  <span className="text-gray-600 text-lg">Loading readings...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <p className="text-gray-700 text-lg">{error}</p>
                <Button
                  onClick={loadReadings}
                  variant="outline"
                  className="border-2"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredReadings.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#0b1f3a]">
                        Tenant
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#0b1f3a]">
                        Property
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#0b1f3a]">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#0b1f3a]">
                        Utility
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#0b1f3a]">
                        Reading
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#0b1f3a]">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#0b1f3a]">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReadings.map((r, idx) => (
                      <tr
                        key={r.id}
                        className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                      >
                        <td className="px-4 py-3 font-medium text-[#0b1f3a]">
                          {(() => {
                            const tenant = r.leaseUtility.Lease.tenant; // use the tenant object
                            if (!tenant) return r.leaseUtility.Lease.tenantName || "Unknown Tenant"; // fallback
                            const name = `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim();
                            return name || r.leaseUtility.Lease.tenantName || "Unknown Tenant";
                          })()}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {r.leaseUtility.Lease.propertyName || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {r.leaseUtility.Lease.unitNumber ?? r.leaseUtility.Lease.unit?.number ?? "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <Zap className="w-3 h-3" />
                            {r.leaseUtility.utility.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#15386a]">
                          {r.readingValue} units
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          {formatCurrency(r.amount)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {formatDate(r.readingDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 space-y-6">
                <div className="bg-gray-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    No meter readings yet
                  </p>
                  <p className="text-gray-500">
                    Start tracking utility usage by adding your first reading
                  </p>
                </div>
                <Link href="/property-manager/content/meter-readings/new">
                  <Button className="bg-[#30D5C8] hover:bg-[#28bfb3] text-[#0b1f3a] font-semibold h-12 px-6">
                    <Plus className="mr-2 w-5 h-5" /> Add Your First Reading
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}