// src/components/PropertyManager/UnitsModal.tsx
"use client";

import { useEffect, useState } from "react";
import UnitsTable from "./UnitsTable";
import { fetchUnits } from "@/lib/units";

interface Props {
  propertyId: string;
  onClose: () => void;
}

export default function UnitsModal({ propertyId, onClose }: Props) {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const data = await fetchUnits(propertyId);
        setUnits(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch units");
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [propertyId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-5xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 text-lg hover:text-gray-700 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Units Overview</h2>

        {loading && <p>Loading units...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <UnitsTable propertyId={propertyId} units={units} inModal />}
      </div>
    </div>
  );
}
