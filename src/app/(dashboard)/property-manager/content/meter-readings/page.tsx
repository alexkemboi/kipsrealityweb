//app/(dashboard)/property-manager/content/meter-readings/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import { Plus, Loader2, AlertCircle, Search, Calendar, Trash2, FileText } from "lucide-react";
import Link from "next/link";

interface Reading {
  id: string;
  reading_value: number;
  amount: number | null;
  readingDate: string;
  lease_utility: {
    id: string;
    Lease: { 
      id: string;
      tenantName?: string;
      unitNumber?: string;
    };
    utility: { 
      name: string;
      type: string;
    };
  };
}

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = readings.filter((r) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          r.lease_utility.utility.name.toLowerCase().includes(searchLower) ||
          r.lease_utility.Lease.id.toLowerCase().includes(searchLower) ||
          r.lease_utility.Lease.tenantName?.toLowerCase().includes(searchLower) ||
          r.lease_utility.Lease.unitNumber?.toLowerCase().includes(searchLower)
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
      setError(null);
      const res = await fetch("/api/utility-readings");
      const data = await res.json();
      
      if (data.success) {
        const sortedReadings = (data.data || []).sort(
          (a: Reading, b: Reading) => 
            new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
        );
        setReadings(sortedReadings);
        setFilteredReadings(sortedReadings);
      } else {
        setError(data.error || "Failed to load readings");
        toast.error("Failed to load readings");
      }
    } catch (err) {
      setError("An error occurred while loading readings");
      toast.error("Failed to load readings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, utilityName: string) => {
    if (!confirm(`Are you sure you want to delete this ${utilityName} reading? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/utility-readings/${id}`, { 
        method: "DELETE" 
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Reading deleted successfully");
        setReadings((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(data.error || "Failed to delete reading");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the reading");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalAmount = () => {
    return filteredReadings.reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meter Readings</h1>
          <p className="text-gray-500 mt-1">Track and manage utility meter readings</p>
        </div>
        <Link href="/property-manager/content/meter-readings/new">
          <Button>
            <Plus className="mr-2 w-4 h-4" /> Add Reading
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      {!isLoading && !error && readings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Readings</p>
                  <p className="text-2xl font-bold">{filteredReadings.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(getTotalAmount())}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Latest Reading</p>
                  <p className="text-sm font-medium">
                    {filteredReadings.length > 0 
                      ? new Date(filteredReadings[0].readingDate).toLocaleDateString()
                      : "—"
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Readings ({filteredReadings.length})</CardTitle>
            {readings.length > 0 && (
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by utility, lease, or tenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading readings...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-gray-500">{error}</p>
              <Button onClick={loadReadings} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredReadings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Lease</TableHead>
                    <TableHead>Utility</TableHead>
                    <TableHead className="text-right">Reading Value</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadings.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(r.readingDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            #{r.lease_utility.Lease.id.slice(0, 8)}
                          </span>
                          {r.lease_utility.Lease.tenantName && (
                            <span className="text-xs text-gray-500">
                              {r.lease_utility.Lease.tenantName}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {r.lease_utility.utility.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {r.reading_value.toFixed(2)} units
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(r.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(r.id, r.lease_utility.utility.name)}
                          disabled={deletingId === r.id}
                          title="Delete Reading"
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12 space-y-4">
              <Search className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">No readings found matching "{searchTerm}"</p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">No meter readings recorded yet</p>
              <Link href="/property-manager/content/meter-readings/new">
                <Button variant="outline">
                  <Plus className="mr-2 w-4 h-4" /> Add Your First Reading
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}