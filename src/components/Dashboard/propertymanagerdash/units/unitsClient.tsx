"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UnitRow = {
  id: string;
  unitNumber: string;
  unitName: string | null;
  isOccupied: boolean;
  rentAmount: number | null;
  property: { id: string; name: string | null; address: string | null; city: string | null };
};

export default function UnitsClient({ initialOccupied }: { initialOccupied?: string | null }) {
  const [occupiedFilter, setOccupiedFilter] = useState<string>(initialOccupied ?? "ALL");
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep in sync if URL filter changes
  useEffect(() => {
    if (initialOccupied !== null && initialOccupied !== undefined) {
      setOccupiedFilter(initialOccupied);
    }
  }, [initialOccupied]);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (occupiedFilter === "0" || occupiedFilter === "1") qs.set("occupied", occupiedFilter);
    return qs.toString();
  }, [occupiedFilter]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/units${queryString ? `?${queryString}` : ""}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load units");

        const data = (await res.json()) as UnitRow[];
        if (!cancelled) setUnits(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load units");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading units…</div>;
  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Units</h1>
          <p className="text-sm text-muted-foreground">Filter by occupancy and drill into a unit.</p>
        </div>

        <select
          className="border rounded px-2 py-1 text-sm bg-background"
          value={occupiedFilter}
          onChange={(e) => setOccupiedFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="0">Vacant</option>
          <option value="1">Occupied</option>
        </select>
      </div>

      {units.length === 0 ? (
        <div className="text-sm text-muted-foreground">No units found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((u) => (
            <Card key={u.id} className="shadow hover:shadow-lg transition-shadow rounded-xl">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {u.unitName ?? `Unit ${u.unitNumber}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {u.property?.name ?? "Property"} • {u.property?.city ?? ""}
                    </div>
                  </div>
                  <Badge variant={u.isOccupied ? "destructive" : "secondary"}>
                    {u.isOccupied ? "Occupied" : "Vacant"}
                  </Badge>
                </div>

                <div className="text-sm">
                  Rent: {u.rentAmount ? `$${Number(u.rentAmount).toLocaleString()}` : "—"}
                </div>

                {/* If you have a unit details page, point this there. Otherwise remove. */}
                <Link href={`/property-manager/view-property`} className="text-sm underline">
                  View Property
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
