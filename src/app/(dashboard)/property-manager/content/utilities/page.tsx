"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import Link from "next/link";

interface Utility {
  id: string;
  name: string;
  type: "FIXED" | "METERED";
  unitPrice?: number;
  fixedAmount?: number;
  propertyId?: string;
  unitId?: string;
}

interface Property {
  id: string;
  name: string;
  units?: { id: string; unitNumber: string }[];
}

export default function UtilitiesPage() {
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // No need to get token manually; API will read cookie automatically
      const [utilRes, propRes] = await Promise.all([
        fetch("/api/utilities"),
        fetch("/api/propertymanager"),
      ]);

      const [utilData, propData] = await Promise.all([utilRes.json(), propRes.json()]);

      // ✅ Ensure utilities is an array
      if (utilRes.ok) {
        const list = Array.isArray(utilData)
          ? utilData
          : Array.isArray(utilData.data)
            ? utilData.data
            : [];
        setUtilities(list);
      } else {
        setError(utilData.error || "Failed to load utilities");
        toast.error(utilData.error || "Failed to load utilities");
        setUtilities([]); // fallback
      }

      // ✅ Ensure properties is an array
      if (propRes.ok) {
        const props = Array.isArray(propData)
          ? propData
          : Array.isArray(propData.data)
            ? propData.data
            : [];
        setProperties(props);
      } else {
        toast.error(propData.error || "Failed to load properties");
        setProperties([]); // fallback
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading data");
      toast.error("Failed to load data");
      setUtilities([]); // safe fallback
      setProperties([]); // safe fallback
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    )
      return;
    setDeletingId(id);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/utilities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
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

  const formatCurrency = (amount?: number) =>
    amount
      ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      : "-";

  // ✅ Defensive filtering
  const filteredUtilities = Array.isArray(utilities)
    ? utilities.filter((u) => {
      let match = true;
      if (selectedProperty !== "all") match = u.propertyId === selectedProperty;
      if (match && selectedUnit !== "all") match = u.unitId === selectedUnit;
      return match;
    })
    : [];

  const availableUnits =
    selectedProperty !== "all"
      ? properties.find((p) => p.id === selectedProperty)?.units || []
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <Toaster position="top-right" richColors />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#0b1f3a]">Utilities</h2>
            <p className="text-[#15386a]/70 mt-2">
              Manage utility types and pricing
            </p>
          </div>

          <div className="flex gap-3">
            {/* Add Reading Button */}
            <Link href="/property-manager/content/meter-readings">
              <Button className="bg-[#15386a] hover:bg-[#15386a]/90 text-white shadow-lg shadow-[#15386a]/20 hover:shadow-xl transition-all">
                <Plus className="mr-2 w-4 h-4" /> Reading
              </Button>
            </Link>

            {/* Add Utility Button */}
            <Link href="/property-manager/content/utilities/new">
              <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white shadow-lg shadow-[#30D5C8]/20 hover:shadow-xl transition-all">
                <Plus className="mr-2 w-4 h-4" /> Add Utility
              </Button>
            </Link>
          </div>
        </div>


        {/* Filters */}
        <Card className="border-slate-200 shadow-md rounded-xl">
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
            <Filter className="w-5 h-5 text-[#15386a]" />

            <Select
              value={selectedProperty}
              onValueChange={(val) => {
                setSelectedProperty(val);
                setSelectedUnit("all");
              }}
            >
              <SelectTrigger className="border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a] w-64">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {availableUnits.length > 0 && (
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a] w-64">
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {availableUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      Unit {u.unitNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(selectedProperty !== "all" || selectedUnit !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProperty("all");
                  setSelectedUnit("all");
                }}
                className="text-[#15386a] border-[#15386a]/30 hover:bg-[#15386a]/5"
              >
                Clear Filter
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Utilities Table */}
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white">
            <CardTitle className="text-xl">Utilities</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#30D5C8]" />
                <span className="ml-3 text-[#15386a]">
                  Loading utilities...
                </span>
              </div>
            ) : filteredUtilities.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#30D5C8]/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-[#30D5C8]" />
                </div>
                <p className="text-[#15386a]/70">No utilities found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#0b1f3a]/10">
                      <TableHead className="text-[#0b1f3a] font-semibold">
                        Name
                      </TableHead>
                      <TableHead className="text-[#0b1f3a] font-semibold">
                        Type
                      </TableHead>
                      <TableHead className="text-[#0b1f3a] font-semibold">
                        Unit Price
                      </TableHead>
                      <TableHead className="text-[#0b1f3a] font-semibold">
                        Fixed Amount
                      </TableHead>
                      <TableHead className="text-right text-[#0b1f3a] font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUtilities.map((u) => (
                      <TableRow
                        key={u.id}
                        className="hover:bg-[#30D5C8]/5"
                      >
                        <TableCell className="font-medium text-[#0b1f3a]">
                          {u.name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${u.type === "FIXED"
                                ? "bg-[#15386a]/10 text-[#15386a]"
                                : "bg-[#30D5C8]/10 text-[#30D5C8]"
                              }`}
                          >
                            {u.type === "FIXED" ? "Fixed" : "Metered"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.type === "METERED"
                            ? formatCurrency(u.unitPrice)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {u.type === "FIXED"
                            ? formatCurrency(u.fixedAmount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/property-manager/content/utilities/${u.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[#30D5C8] border-[#30D5C8]/30"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(u.id, u.name)}
                              disabled={deletingId === u.id}
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
