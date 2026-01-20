"use client"
import React from 'react';
import { Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Account {
    id: string;
    code: string;
    name: string;
    type: string;
    balance: number;
    totalDebits: number;
    totalCredits: number;
}

interface LedgerTableProps {
    data: Account[];
    loading?: boolean;
}

const LedgerTable: React.FC<LedgerTableProps> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Code</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Debits</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Credits</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Net Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((account) => (
                            <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {account.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {account.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {account.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${account.totalDebits.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${account.totalCredits.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                                    <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        ${account.balance.toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No ledger accounts found. Ensure the Chart of Accounts is seeded.</p>
                </div>
            )}
        </div>
    );
};

export default LedgerTable;
