"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

// Define the shape of data expected
interface ChartData {
    month: string;
    revenue: number;
    expenses: number;
}

interface RevenueChartProps {
    data: ChartData[];
    isLoading?: boolean;
}

// Custom Tooltip to show currency nicely
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl text-sm">
                <p className="font-bold text-gray-900 mb-2 border-b pb-1">{label}</p>
                <div className="space-y-1">
                    <p className="flex justify-between gap-4 text-emerald-600 font-semibold">
                        <span>Income:</span>
                        <span>${payload[0].value.toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between gap-4 text-red-500 font-semibold">
                        <span>Expenses:</span>
                        <span>${payload[1].value.toLocaleString()}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function RevenueChart({ data, isLoading }: RevenueChartProps) {
    if (isLoading) {
        return <Skeleton className="h-[350px] w-full rounded-2xl" />;
    }

    // Fallback for empty state (New User)
    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] w-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                    <BarChart3 size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold">Waiting for financial data...</p>
                <p className="text-gray-400 text-xs">Trends will appear here once you collect rent.</p>
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
                    />

                    {/* Revenue Bar (Green) */}
                    <Bar
                        dataKey="revenue"
                        name="Monthly Income"
                        fill="#10b981"
                        radius={[6, 6, 6, 6]}
                        barSize={32}
                        stackId="a"
                    />

                    {/* Expenses Bar (Red) */}
                    <Bar
                        dataKey="expenses"
                        name="Operating Costs"
                        fill="#f87171"
                        radius={[6, 6, 6, 6]}
                        barSize={32}
                        stackId="a"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
