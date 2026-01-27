"use client";

import React, { useEffect, useState } from "react";
import {
	Building2, Users, Wallet, AlertCircle,
	Plus, ArrowUpRight, ArrowDownRight, FileText,
	Home, Sparkles, TrendingUp, DollarSign, Activity, Wrench, Calendar
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import RevenueChart from "./RevenueChart";
import { toast } from "sonner"; // Assuming sonner is used for toasts

// Metric Card Component
const MetricCard = ({ title, value, subtext, icon: Icon, color }: any) => (
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
		<p className="text-xs text-gray-500 font-medium">{subtext}</p>
	</div>
);

// --- Quick Action Card Component ---
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

// --- Empty State Component ---
const OnboardingState = () => (
	<div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
		<div className="bg-blue-50 p-6 rounded-full mb-6">
			<Building2 className="w-16 h-16 text-blue-600" />
		</div>
		<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to RentFlow360</h1>
		<p className="text-gray-500 max-w-md mb-8">
			Your dashboard is empty because you haven't added any properties yet.
			Add your first property to unlock powerful analytics.
		</p>
		<Link href="/property-manager/add-property">
			<button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
				<Plus size={20} /> Add First Property
			</button>
		</Link>
	</div>
);

export default function Dashboard() {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/dashboard/analytics");
				if (res.ok) {
					const json = await res.json();
					setData(json);
				}
			} catch (err) {
				console.error(err);
				toast.error("Could not update live stats.");
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
					{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
				</div>
				<Skeleton className="h-80 w-full rounded-xl" />
			</div>
		);
	}

	// Handle "Zero Data" Onboarding State
	if (!data || data.kpis.totalUnits === 0) {
		return <OnboardingState />;
	}

	const { kpis } = data;

	return (
		<div className="p-6 max-w-7xl mx-auto space-y-8">

			{/* SECTION 1: Financial Health (Row 1) */}
			<div>
				<h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
					<div className="p-1.5 bg-emerald-50 rounded-lg">
						<Wallet className="w-6 h-6 text-emerald-600" />
					</div>
					Financial Health
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<MetricCard
						title="Total Revenue (MTD)"
						value={`$${kpis.revenue.toLocaleString()}`}
						subtext="Rent collected this month"
						icon={TrendingUp}
						color="bg-emerald-500"
					/>
					<MetricCard
						title="Net Operating Income"
						value={`$${kpis.noi.toLocaleString()}`}
						subtext="Revenue - Expenses"
						icon={Wallet}
						color="bg-blue-500"
					/>
					<MetricCard
						title="Outstanding Arrears"
						value={`$${kpis.arrears.toLocaleString()}`}
						subtext="Overdue invoices"
						icon={AlertCircle}
						color="bg-red-500"
					/>
					<MetricCard
						title="Vacancy Loss"
						value={`$${kpis.vacancyLoss.toLocaleString()}`}
						subtext="Potential rent lost"
						icon={DollarSign}
						color="bg-orange-500"
					/>
				</div>
			</div>

			{/* SECTION 2: Operational Health (Row 2) */}
			<div>
				<h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
					<div className="p-1.5 bg-blue-50 rounded-lg">
						<Activity className="w-6 h-6 text-blue-600" />
					</div>
					Operations
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<MetricCard
						title="Occupancy Rate"
						value={`${kpis.occupancyRate}%`}
						subtext={`${kpis.totalUnits} Units Under Management`}
						icon={Building2}
						color="bg-indigo-500"
					/>
					<MetricCard
						title="Active Maintenance"
						value={kpis.activeMaintenance}
						subtext="Open tickets"
						icon={Wrench}
						color="bg-amber-500"
					/>
					<MetricCard
						title="Lease Renewals"
						value={kpis.expiringLeases}
						subtext="Expiring in 30 days"
						icon={Calendar}
						color="bg-purple-500"
					/>
					<MetricCard
						title="Average Rent"
						value={`$${(kpis.totalUnits > 0 ? Math.round(kpis.revenue / kpis.totalUnits) : 0).toLocaleString()}`}
						subtext="Per Unit Average"
						icon={TrendingUp}
						color="bg-cyan-500"
					/>
				</div>
			</div>

			{/* SECTION 3: Visual Analytics */}
			<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
				<div className="mb-8">
					<h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
					<p className="text-sm text-gray-500 font-medium">Income vs Expenses (Last 6 Months)</p>
				</div>
				<RevenueChart data={data.chartData} />
			</div>

			{/* SECTION 4: Quick Actions */}
			<div>
				<h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Command Center</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<ActionCard
						title="Register Property"
						desc="Add a new building to portfolio."
						icon={Plus}
						href="/property-manager/add-property"
						color="bg-blue-600 shadow-blue-100"
					/>
					<ActionCard
						title="Onboard Tenant"
						desc="Invite a tenant via link."
						icon={Users}
						href="/property-manager/content/tenants"
						color="bg-emerald-600 shadow-emerald-100"
					/>
					<ActionCard
						title="Post Journal Entry"
						desc="Record an offline expense or income."
						icon={FileText}
						href="/property-manager/finance/journal"
						color="bg-purple-600 shadow-purple-100"
					/>
				</div>
			</div>

		</div>
	);
}
