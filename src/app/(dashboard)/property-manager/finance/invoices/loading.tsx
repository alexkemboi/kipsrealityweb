import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceLoading() {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Title Skeleton */}
                <Skeleton className="h-10 w-64 bg-gray-200" />

                {/* Filters Row Skeleton */}
                <div className="flex flex-wrap gap-4 items-center">
                    <Skeleton className="h-10 w-40 bg-gray-200" />
                    <Skeleton className="h-10 w-40 bg-gray-200" />
                    <Skeleton className="h-10 w-24 bg-gray-200" />
                    <Skeleton className="h-10 w-32 bg-gray-200" />
                </div>

                {/* Table Skeleton */}
                <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 bg-white">
                    <div className="bg-blue-100/50 px-6 py-4 flex justify-between">
                        <Skeleton className="h-4 w-32 bg-blue-200" />
                        <Skeleton className="h-4 w-32 bg-blue-200" />
                        <Skeleton className="h-4 w-32 bg-blue-200" />
                    </div>
                    <div className="divide-y divide-gray-100">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="px-6 py-4 flex justify-between items-center">
                                <Skeleton className="h-5 w-48 bg-gray-100" />
                                <Skeleton className="h-5 w-24 bg-gray-100" />
                                <Skeleton className="h-5 w-32 bg-gray-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
