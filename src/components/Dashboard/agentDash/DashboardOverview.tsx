"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Home,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  MessageSquare,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Metric Card Component
const MetricCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500 font-medium">{subtext}</p>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  </div>
);

// Action Card Component
const ActionCard = ({ title, desc, icon: Icon, href, color }: any) => (
  <Link href={href} className="group">
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-blue-200 cursor-pointer h-full">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">{desc}</p>
    </div>
  </Link>
);

// Empty State Component
const OnboardingState = () => (
  <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
    <div className="bg-blue-50 p-6 rounded-full mb-6">
      <Users className="w-16 h-16 text-blue-600" />
    </div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Agent</h1>
    <p className="text-gray-500 max-w-md mb-8">
      Your dashboard is ready! Start by exploring listings or contacting potential clients.
    </p>
    <div className="flex gap-4">
      <Link href="/agent/listings">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
          <Search size={20} /> Browse Listings
        </button>
      </Link>
      <Link href="/agent/clients">
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
          <MessageSquare size={20} /> Contact Clients
        </button>
      </Link>
    </div>
  </div>
);

export default function DashboardOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/analytics?role=AGENT");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Handle empty data state
  if (!data) {
    return <OnboardingState />;
  }

  const { metrics } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your listings, clients, and commissions</p>
        </div>
        <div className="flex gap-3">
          <Link href="/agent/listings/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Plus size={18} /> New Listing
            </button>
          </Link>
          <Link href="/agent/reports">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <FileText size={18} /> Reports
            </button>
          </Link>
        </div>
      </div>

      {/* SECTION 1: Performance Metrics */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Listings"
            value={metrics?.activeListings || "0"}
            subtext="Properties listed"
            icon={Home}
            color="bg-blue-500"
            trend={12}
          />
          <MetricCard
            title="Total Clients"
            value={metrics?.totalClients || "0"}
            subtext="Registered clients"
            icon={Users}
            color="bg-emerald-500"
            trend={8}
          />
          <MetricCard
            title="Monthly Commission"
            value={`$${(metrics?.monthlyCommission || 0).toLocaleString()}`}
            subtext="Estimated earnings"
            icon={DollarSign}
            color="bg-purple-500"
            trend={15}
          />
          <MetricCard
            title="Pending Showings"
            value={metrics?.pendingShowings || "0"}
            subtext="Scheduled viewings"
            icon={Calendar}
            color="bg-amber-500"
            trend={-5}
          />
        </div>
      </div>

      {/* SECTION 2: Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <Link href="/agent/activity" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { id: 1, action: "Listing published", target: "Downtown Apartment", time: "2 hours ago" },
              { id: 2, action: "Client contacted", target: "John Smith", time: "1 day ago" },
              { id: 3, action: "Showing scheduled", target: "Luxury Villa", time: "2 days ago" },
              { id: 4, action: "Offer received", target: "Garden Suite", time: "3 days ago" },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.target} • {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Listing Conversion Rate</span>
                <span className="text-sm font-bold text-gray-900">24%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "24%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Avg. Time to Close</span>
                <span className="text-sm font-bold text-gray-900">42 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Client Satisfaction</span>
                <span className="text-sm font-bold text-gray-900">4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "96%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            title="Create Listing"
            desc="Add a new property to the marketplace"
            icon={Plus}
            href="/agent/listings/create"
            color="bg-blue-600 shadow-blue-100"
          />
          <ActionCard
            title="Manage Clients"
            desc="View and contact your client list"
            icon={Users}
            href="/agent/clients"
            color="bg-emerald-600 shadow-emerald-100"
          />
          <ActionCard
            title="Schedule Showings"
            desc="Arrange property viewings"
            icon={Calendar}
            href="/agent/showings"
            color="bg-purple-600 shadow-purple-100"
          />
        </div>
      </div>

      {/* SECTION 4: Upcoming Tasks */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Upcoming Tasks</h3>
          <Link href="/agent/tasks" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Tasks
          </Link>
        </div>
        <div className="space-y-4">
          {[
            { id: 1, task: "Follow up with client", property: "Downtown Apartment", time: "Today, 2:00 PM", priority: "high" },
            { id: 2, task: "Property inspection", property: "Luxury Villa", time: "Tomorrow, 10:00 AM", priority: "medium" },
            { id: 3, task: "Prepare listing photos", property: "Garden Suite", time: "Friday, 3:00 PM", priority: "low" },
            { id: 4, task: "Contract review", property: "City Center Loft", time: "Next Monday", priority: "medium" },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <div>
                  <p className="font-medium text-gray-900">{item.task}</p>
                  <p className="text-sm text-gray-500">{item.property}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{item.time}</p>
                <p className="text-xs text-gray-500 capitalize">{item.priority} priority</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}