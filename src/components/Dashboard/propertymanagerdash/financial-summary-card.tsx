'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialSummary {
  cashInBank: number;
  accountsReceivable: number;
  accountsPayable: number;
  rentalIncome: number;
  utilityExpense: number;
  netOperatingIncome: number;
  currency: string;
}

export function FinancialSummaryCard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  async function fetchFinancialSummary() {
    try {
      setLoading(true);
      const response = await fetch('/api/finance/summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial summary');
      }

      const data = await response.json();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Loading financial data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription className="text-red-600">Error: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={fetchFinancialSummary}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary.currency || 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
        <CardDescription>Real-time financial position from General Ledger</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Cash in Bank */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-600">Cash in Bank</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {formatCurrency(summary.cashInBank)}
            </p>
            <p className="text-xs text-green-600 mt-1">Available funds</p>
          </div>

          {/* Accounts Receivable */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-600">Accounts Receivable</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(summary.accountsReceivable)}
            </p>
            <p className="text-xs text-blue-600 mt-1">Outstanding from tenants</p>
          </div>

          {/* Accounts Payable */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-orange-600">Accounts Payable</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {formatCurrency(summary.accountsPayable)}
            </p>
            <p className="text-xs text-orange-600 mt-1">Owed to vendors</p>
          </div>

          {/* Rental Income */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-600">Rental Income</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {formatCurrency(summary.rentalIncome)}
            </p>
            <p className="text-xs text-purple-600 mt-1">Total earned</p>
          </div>

          {/* Utility Expense */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-600">Utility Expense</p>
            <p className="text-2xl font-bold text-red-900 mt-1">
              {formatCurrency(summary.utilityExpense)}
            </p>
            <p className="text-xs text-red-600 mt-1">Total utilities cost</p>
          </div>

          {/* Net Operating Income */}
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm font-medium text-indigo-600">Net Operating Income</p>
            <p className="text-2xl font-bold text-indigo-900 mt-1">
              {formatCurrency(summary.netOperatingIncome)}
            </p>
            <p className="text-xs text-indigo-600 mt-1">Income - Expenses</p>
          </div>

        </div>

        {/* Refresh Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchFinancialSummary}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </CardContent>
    </Card>
  );
}