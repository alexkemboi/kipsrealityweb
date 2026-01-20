"use client"
import React, { useEffect, useState } from 'react';
import JournalTable from '@/components/Dashboard/propertymanagerdash/finance/JournalTable';
import { FileText, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const JournalPage = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const fetchJournal = async (p = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/finance/journal?page=${p}&limit=10`);
            const result = await res.json();
            if (result.success) {
                setEntries(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch journal:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournal(page);
    }, [page]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-row justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        Journal Entries
                    </h1>
                    <p className="text-gray-600 font-medium">Audit trail of all financial postings and transactions.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by description or ref..."
                            className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                        />
                    </div>
                    <button
                        onClick={() => fetchJournal(page)}
                        className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <JournalTable data={entries} loading={loading} />

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-500">
                        Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{pagination.pages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            disabled={page === pagination.pages}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalPage;
