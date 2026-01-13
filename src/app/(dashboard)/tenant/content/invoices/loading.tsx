import { Skeleton } from "@/components/ui/skeleton";

export default function TenantInvoiceLoading() {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48 bg-slate-200" />
                    <Skeleton className="h-4 w-64 bg-slate-200" />
                </div>

                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <Skeleton className="h-4 w-24 mb-2 bg-slate-100" />
                            <Skeleton className="h-8 w-32 bg-slate-200" />
                        </div>
                    ))}
                </div>

                {/* Responsive List/Table Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4">
                        <Skeleton className="h-4 w-full bg-slate-200" />
                    </div>
                    <div className="divide-y divide-slate-100 p-6 space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-32 bg-slate-200" />
                                    <Skeleton className="h-4 w-24 bg-slate-100" />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
                                    <Skeleton className="h-5 w-24 bg-slate-100" />
                                    <Skeleton className="h-10 w-28 bg-slate-200 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
