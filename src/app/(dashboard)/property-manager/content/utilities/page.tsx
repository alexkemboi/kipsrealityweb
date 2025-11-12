"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Loader2, AlertCircle } from "lucide-react";
import { Toaster, toast } from "sonner";
import Link from "next/link";

interface Utility {
  id: string;
  name: string;
  type: "FIXED" | "METERED";
  unitPrice?: number;
  fixedAmount?: number;
}

export default function UtilitiesPage() {
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUtilities();
  }, []);

  const loadUtilities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/utilities");
      const data = await res.json();
      
      if (data.success) {
        setUtilities(data.data || []);
      } else {
        setError(data.error || "Failed to load utilities");
        toast.error("Failed to load utilities");
      }
    } catch (err) {
      setError("An error occurred while loading utilities");
      toast.error("Failed to load utilities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/utilities/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success(`"${name}" deleted successfully`);
        setUtilities((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error(data.error || "Failed to delete utility");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the utility");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#0b1f3a]">Utilities</h2>
            <p className="text-[#15386a]/70 mt-2">Manage utility types and pricing</p>
          </div>
          <Link href="/property-manager/content/utilities/new">
            <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white shadow-lg shadow-[#30D5C8]/20 hover:shadow-xl hover:shadow-[#30D5C8]/30 transition-all">
              <Plus className="mr-2 w-4 h-4" /> Add Utility
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white">
            <CardTitle className="text-xl">All Utilities</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#30D5C8]" />
                <span className="ml-3 text-[#15386a]">Loading utilities...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-[#15386a]/70">{error}</p>
                <Button onClick={loadUtilities} variant="outline" className="border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/5">
                  Try Again
                </Button>
              </div>
            ) : utilities.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#30D5C8]/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-[#30D5C8]" />
                </div>
                <p className="text-[#15386a]/70">No utilities found</p>
                <Link href="/property-manager/content/utilities/new">
                  <Button variant="outline" className="border-2 border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/5">
                    <Plus className="mr-2 w-4 h-4" /> Create Your First Utility
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#0b1f3a]/10 hover:bg-transparent">
                      <TableHead className="text-[#0b1f3a] font-semibold">Name</TableHead>
                      <TableHead className="text-[#0b1f3a] font-semibold">Type</TableHead>
                      <TableHead className="text-[#0b1f3a] font-semibold">Unit Price</TableHead>
                      <TableHead className="text-[#0b1f3a] font-semibold">Fixed Amount</TableHead>
                      <TableHead className="text-right text-[#0b1f3a] font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {utilities.map((u) => (
                      <TableRow key={u.id} className="border-b border-slate-100 hover:bg-[#30D5C8]/5 transition-colors">
                        <TableCell className="font-medium text-[#0b1f3a]">{u.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            u.type === "FIXED" ? "bg-[#15386a]/10 text-[#15386a]" : "bg-[#30D5C8]/10 text-[#30D5C8]"
                          }`}>
                            {u.type === "FIXED" ? "Fixed" : "Metered"}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#15386a]">
                          {u.type === "METERED" ? formatCurrency(u.unitPrice) : "-"}
                        </TableCell>
                        <TableCell className="text-[#15386a]">
                          {u.type === "FIXED" ? formatCurrency(u.fixedAmount) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link href={`/property-manager/content/utilities/${u.id}`}>
                              <Button variant="outline" size="sm" title="Assign to Leases" className="bg-[#30D5C8]/10 hover:bg-[#30D5C8]/20 text-[#30D5C8] border-[#30D5C8]/30">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(u.id, u.name)}
                              disabled={deletingId === u.id}
                              title="Delete Utility"
                              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                            >
                              {deletingId === u.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}