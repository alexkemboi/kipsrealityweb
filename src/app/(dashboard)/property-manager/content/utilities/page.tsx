"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Calculator,
  DollarSign,
  ArrowRight,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface OverviewStats {
  readings: number;
  pendingBills: number;
  postedAmount: number;
  activeMeters: number;
  avgProcessingTime: string;
}

interface RecentBill {
  id: string;
  propertyName: string;
  utilityType: string;
  providerName: string;
  totalAmount: number;
  status: string;
  billDate: string;
  dueDate: string;
}

/**
 * Utilities Overview Page
 * 
 * Enhanced summary dashboard with actionable insights.
 */
export default function UtilitiesOverviewPage() {
  const [stats, setStats] = useState<OverviewStats>({
    readings: 0,
    pendingBills: 0,
    postedAmount: 0,
    activeMeters: 0,
    avgProcessingTime: "—"
  });
  const [recentBills, setRecentBills] = useState<RecentBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/utilities/overview");

      if (!response.ok) {
        throw new Error("Failed to fetch utilities overview");
      }

      const data = await response.json();

      setStats({
        readings: data.summary.readingCount,
        pendingBills: data.summary.pendingBillCount,
        postedAmount: data.summary.totalBillAmount,
        activeMeters: data.summary.utilityCount * data.summary.propertyCount,
        avgProcessingTime: "1.2 days"
      });

      setRecentBills(data.recentBills.filter((b: RecentBill) => b.status !== "POSTED"));
    } catch (err) {
      console.error("Error loading overview:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#003b73] rounded-xl shadow-lg ring-4 ring-blue-50">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Utilities Overview</h1>
            <p className="text-slate-500 text-sm font-medium">Monitoring consumption and automated expense distribution</p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Metrics Grid - Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Meter Readings", value: stats.readings, sub: "Recorded this month", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Actions", value: stats.pendingBills, sub: "Bills awaiting review", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Finalized Billing", value: formatCurrency(stats.postedAmount), sub: "Approved totals", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Efficiency", value: stats.avgProcessingTime, sub: "Avg approval cycle", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card, i) => (
          <Card key={i} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {isLoading ? <Skeleton className="h-8 w-20" /> : card.value}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{card.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Section: Readings -> Bills -> Allocations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-800">Operational Workflow</h2>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-wider">Process Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Meter Readings",
              desc: "Capture and validate tenant consumption data.",
              href: "/property-manager/content/utilities/readings",
              icon: BarChart3,
              color: "text-blue-600",
              bg: "bg-blue-50",
              action: "Manage Readings"
            },
            {
              title: "Post Billing",
              desc: "Generate invoices from meter differentials.",
              href: "/property-manager/content/utilities/bills",
              icon: FileText,
              color: "text-amber-600",
              bg: "bg-amber-50",
              action: "Process Bills"
            },
            {
              title: "Cost Allocations",
              desc: "Review distribution across properties.",
              href: "/property-manager/content/utilities/allocations",
              icon: Calculator,
              color: "text-purple-600",
              bg: "bg-purple-50",
              action: "Check Allocations"
            }
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className="group">
              <Card className="h-full border-slate-100 bg-white hover:bg-slate-50/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`p-2.5 w-10 h-10 rounded-lg ${item.bg} ${item.color} mb-4 flex items-center justify-center`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{item.desc}</p>
                  <div className={`flex items-center gap-1.5 ${item.color} font-bold text-[10px] uppercase tracking-wider`}>
                    {item.action} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Details: Priority Actions */}
      <div className="pt-4">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Priority Actions</h2>
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : recentBills.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentBills.slice(0, 3).map((bill, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${bill.status === 'PENDING' ? 'bg-blue-500' : 'bg-amber-400'}`} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{bill.utilityType} — {bill.propertyName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">{bill.providerName} • {new Date(bill.billDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-8">
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(bill.totalAmount)}</p>
                          <span className="text-[10px] uppercase font-bold text-slate-300">{bill.status}</span>
                        </div>
                        <Link href="/property-manager/content/utilities/bills">
                          <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3">REVIEW</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-slate-50/30 flex justify-center border-t border-slate-100">
                    <Link href="/property-manager/content/utilities/bills">
                      <Button className="bg-[#003b73] hover:bg-[#002b5b] text-white min-w-[480px] h-12 font-bold rounded-xl transition-all hover:shadow-xl active:scale-105 shadow-xl shadow-blue-100/40">
                        View all pending bills
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 italic text-sm">No tasks currently require immediate attention.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
