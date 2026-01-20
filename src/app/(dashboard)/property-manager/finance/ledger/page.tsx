"use client"
import React, { useEffect, useState } from 'react';
import LedgerTable from '@/components/Dashboard/propertymanagerdash/finance/LedgerTable';
import { useAuth } from "@/context/AuthContext";
import { Calculator, Download, RefreshCw } from 'lucide-react';

const LedgerPage = () => {
    const { user } = useAuth();
    const token = typeof window !== 'undefined' ? localStorage.getItem('rentflow_tokens') : null;

    const [ledgerData, setLedgerData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/finance/ledger');
            const result = await res.json();
            if (result.success) {
                setLedgerData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch ledger:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-row justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-blue-600" />
                        General Ledger
                    </h1>
                    <p className="text-gray-600 font-medium">Real-time balances for all accounts in your organization.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchLedger}
                        className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-lg">
                        <Download className="w-4 h-4" />
                        Export Trial Balance
                    </button>
                </div>
            </div>

            <LedgerTable data={ledgerData} loading={loading} />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Accounting Note
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
                    This ledger reflects double-entry postings generated automatically from Invoices and Payments.
                    Asset and Expense accounts show <strong>Debits - Credits</strong>, while Liability, Equity, and Income accounts show <strong>Credits - Debits</strong>.
                </p>
            </div>
        </div>
    );
};

export default LedgerPage;
