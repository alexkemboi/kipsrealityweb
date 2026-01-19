"use client"
import React from 'react';
import { FileText, Link as LinkIcon, Building2 } from 'lucide-react';

interface JournalLine {
    id: string;
    description: string;
    debit: number;
    credit: number;
    account: {
        code: string;
        name: string;
    };
    property?: {
        address: string;
        city: string;
    };
    unit?: {
        unitNumber: string;
    };
}

interface JournalEntry {
    id: string;
    transactionDate: string;
    description: string;
    reference: string;
    postedAt: string;
    lines: JournalLine[];
}

interface JournalTableProps {
    data: JournalEntry[];
    loading?: boolean;
}

const JournalTable: React.FC<JournalTableProps> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {data.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 flex flex-row justify-between items-center border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">{entry.description}</h3>
                                <p className="text-xs text-gray-500">
                                    Ref: {entry.reference || 'N/A'} • {new Date(entry.transactionDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                POSTED
                            </span>
                        </div>
                    </div>

                    {/* Lines */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-gray-400">Account</th>
                                    <th className="px-6 py-3 font-semibold text-gray-400">Description</th>
                                    <th className="px-6 py-3 font-semibold text-gray-400 text-right">Debit</th>
                                    <th className="px-6 py-3 font-semibold text-gray-400 text-right">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {entry.lines.map((line) => (
                                    <tr key={line.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{line.account.name}</div>
                                            <div className="text-xs text-blue-600 font-mono">{line.account.code}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-gray-600">{line.description || entry.description}</div>
                                            {(line.property || line.unit) && (
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                                                    <Building2 className="w-3 h-3" />
                                                    {line.property?.address} {line.unit ? `(Unit ${line.unit.unitNumber})` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-medium text-gray-900">
                                            {line.debit > 0 ? `$${line.debit.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-medium text-gray-900">
                                            {line.credit > 0 ? `$${line.credit.toLocaleString()}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {data.length === 0 && (
                <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No journal entries found.</p>
                </div>
            )}
        </div>
    );
};

export default JournalTable;
