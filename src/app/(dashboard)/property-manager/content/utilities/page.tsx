//app/(dashboard)/property-manager/content/utilities/page.tsx

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
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Utilities</h2>
          <p className="text-gray-500 mt-1">Manage utility types and pricing</p>
        </div>
        <Link href="/property-manager/content/utilities/new">
          <Button>
            <Plus className="mr-2 w-4 h-4" /> Add Utility
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Utilities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading utilities...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-gray-500">{error}</p>
              <Button onClick={loadUtilities} variant="outline">
                Try Again
              </Button>
            </div>
          ) : utilities.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-gray-500">No utilities found</p>
              <Link href="/property-manager/content/utilities/new">
                <Button variant="outline">
                  <Plus className="mr-2 w-4 h-4" /> Create Your First Utility
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Fixed Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utilities.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.type === "FIXED" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}>
                          {u.type === "FIXED" ? "Fixed" : "Metered"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {u.type === "METERED" ? formatCurrency(u.unitPrice) : "-"}
                      </TableCell>
                      <TableCell>
                        {u.type === "FIXED" ? formatCurrency(u.fixedAmount) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/property-manager/content/utilities/${u.id}`}>
                            <Button variant="outline" size="sm" title="Assign to Leases">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(u.id, u.name)}
                            disabled={deletingId === u.id}
                            title="Delete Utility"
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
  );
}