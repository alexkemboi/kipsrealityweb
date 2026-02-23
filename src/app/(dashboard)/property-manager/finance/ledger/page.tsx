"use client";

import React, { useCallback, useEffect, useState } from "react";
import LedgerTable from "@/components/Dashboard/propertymanagerdash/finance/LedgerTable";
import { Calculator, Download, RefreshCw } from "lucide-react";
// import { useAuth } from "@/context/AuthContext"; // remove if not used

type LedgerRow = {
  id?: string | number;
  accountCode?: string;
  accountName?: string;
  accountType?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  [key: string]: unknown;
};

type LedgerResponse = {
  success: boolean;
  data: LedgerRow[];
  message?: string;
};

const LedgerPage = () => {
  // const { user } = useAuth(); // remove/comment if not used

  const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/finance/ledger", {
        method: "GET",
        signal,
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const result: LedgerResponse = await res.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch ledger");
      }

      setLedgerData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("Failed to fetch ledger:", err);
      setError((err as Error).message || "Failed to fetch ledger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchLedger(controller.signal);
    return () => controller.abort();
  }, [fetchLedger]);

  const handleExport = () => {
    // TODO: wire to real export endpoint
    console.log("Export Trial Balance clicked");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            General Ledger
          </h1>
          <p className="text-gray-600 font-medium">
            Real-time balances for all accounts in your organization.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fetchLedger()}
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export Trial Balance
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <LedgerTable data={ledgerData} loading={loading} />

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Accounting Note
        </h4>
        <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
          This ledger reflects double-entry postings generated automatically from
          Invoices and Payments. Asset and Expense accounts show{" "}
          <strong>Debits - Credits</strong>, while Liability, Equity, and Income
          accounts show <strong>Credits - Debits</strong>.
        </p>
      </div>
    </div>
  );
};

export default LedgerPage;
