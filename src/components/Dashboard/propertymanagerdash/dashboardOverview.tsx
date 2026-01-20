"use client"
import React, { useEffect, useState } from "react";
import { Users, Calendar, AlertCircle, Home, Wrench, ChevronDown, TrendingUp, DollarSign } from 'lucide-react';
import { UpcomingLeasesCard } from './UpcomingLeasesCard';
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import OccupancyLineChart from "./OccupancyLineChart";

// --- SKELETON COMPONENTS ---
const SkeletonBlock = ({ height = '24px', width = '100%', className = '' }) => (
	<div
		className={`bg-gray-200 animate-pulse rounded ${className}`}
		style={{ height, width }}
	/>
);

const SkeletonCard = () => (
	<div className="bg-white rounded-xl shadow-2xl p-4 flex flex-col gap-2">
		<div className="flex items-center gap-3 mb-2">
			<SkeletonBlock height="24px" width="24px" className="rounded-full!" />
			<SkeletonBlock height="16px" width="80px" />
		</div>
		<SkeletonBlock height="32px" width="100px" />
	</div>
);

const SkeletonListItem = () => (
	<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
		<div className="flex-1">
			<SkeletonBlock height="16px" width="120px" />
			<SkeletonBlock height="12px" width="80px" className="mt-2" />
		</div>
		<SkeletonBlock height="20px" width="60px" />
	</div>
);

// --- DASHBOARD COMPONENT ---
const Dashboard = () => {

	// --- TYPES ---
	type Properties = {
		id: string,
		name: string,
		city: string,
		units: number,
		apartmentComplexDetail?: { buildingName?: string } | null,
		houseDetail?: { houseName?: string } | null
	}

	interface Lease {
		endDate?: string;
	}

	// --- HELPERS ---
	function getPropertyDisplayName(property: Properties): string {
		return property?.apartmentComplexDetail?.buildingName || property?.houseDetail?.houseName || property?.name;
	}

	function usePersistedNumber(key: string) {
		return useState<number | undefined>(() => {
			if (typeof window !== 'undefined') {
				const cached = localStorage.getItem(key);
				return cached !== null ? Number(cached) : undefined;
			}
			return undefined;
		});
	}

	// --- STATE ---
	const { user, isLoading: authLoading } = useAuth(); // Assuming useAuth exposes loading
	const organizationId = user?.organization?.id;

	// Dynamic maintenance requests state
	const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
	const [selectedProperty, setSelectedProperty] = useState('all');
	const [myproperties, setMyProperties] = useState<Properties[]>([])
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Metrics
	const [pendingMaintenance, setPendingMaintenance] = usePersistedNumber('dashboard_pendingMaintenance');
	const userId = user?.id || 'unknown';
	const occupancyKey = `dashboard_occupancyRate_${userId}`;
	const [occupancyRate, setOccupancyRate] = usePersistedNumber(occupancyKey);
	const [financials, setFinancials] = useState<{ cashInBank: number, outstandingArrears: number }>(() => {
		if (typeof window !== 'undefined') {
			const cached = localStorage.getItem('dashboard_financials');
			return cached ? JSON.parse(cached) : { cashInBank: 0, outstandingArrears: 0 };
		}
		return { cashInBank: 0, outstandingArrears: 0 };
	});
	const [availableProperties, setAvailableProperties] = usePersistedNumber('dashboard_availableProperties');

	const [propertyUnits, setPropertyUnits] = useState<{ [propertyId: string]: number }>({});
	const [tenantApplications, setTenantApplications] = useState<any[]>([]);
	const [stats, setStats] = useState<any>({});
	const [leasesData, setLeasesData] = useState<Lease[]>([]);
	const [upcomingLeases, setUpcomingLeases] = useState<any[]>([]);
	const [tenants, setTenants] = useState(0);

	// Pagination / Limiters
	const [upcomingLeasesToShow, setUpcomingLeasesToShow] = useState(5);
	const [maintenanceToShow, setMaintenanceToShow] = useState(5);

	// --- EFFECT: Get Token ---
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const storedTokens = localStorage.getItem('rentflow_tokens');
		if (!storedTokens) return;

		try {
			const parsed = JSON.parse(storedTokens);

			// Support multiple historical shapes:
			// - { accessToken, refreshToken, expiresAt } (current AuthContext)
			// - "<jwt>" (older bug where only the access token string was stored)
			// - { tokens: { accessToken } } (common API response wrapper)
			const extractedToken =
				(typeof parsed === 'string' ? parsed : null) ||
				(parsed && typeof parsed === 'object' && 'accessToken' in parsed ? (parsed as any).accessToken : null) ||
				(parsed && typeof parsed === 'object' && (parsed as any).tokens?.accessToken ? (parsed as any).tokens.accessToken : null);

			if (extractedToken) setToken(extractedToken);
		} catch (error) {
			// If it's not JSON, assume it's a raw token string.
			setToken(storedTokens);
		}
	}, []);

	// --- HELPER: SAFE FETCH ---
	// This prevents the "Unexpected end of JSON" crash by checking response text first
	const safeFetch = async (url: string, options: any = {}) => {
		// 1. GET TOKEN (Try to get from current state or localStorage)
		let currentToken = token;
		if (!currentToken && typeof window !== 'undefined') {
			const stored = localStorage.getItem('rentflow_tokens');
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					currentToken =
						(typeof parsed === 'string' ? parsed : null) ||
						parsed?.accessToken ||
						parsed?.tokens?.accessToken ||
						stored;
				} catch {
					currentToken = stored;
				}
			}
		}

		// 2. STOP IF MISSING (Prevent loops)
		if (!currentToken) {
			console.warn("[Dashboard] No token found. Redirecting to login.");
			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
			return null;
		}

		try {
			const headers = {
				'Content-Type': 'application/json',
				...options.headers,
				'Authorization': `Bearer ${currentToken}`,
			};

			const res = await fetch(url, { ...options, headers });

			// 3. HANDLE EXPIRED TOKEN (401)
			if (res.status === 401) {
				console.error(`[Dashboard] Token expired or invalid (401) on ${url}. Logging out.`);
				if (typeof window !== 'undefined') {
					localStorage.removeItem('rentflow_tokens');
					localStorage.removeItem('rentflow_user');
					window.location.href = '/login';
				}
				return null;
			}

			const text = await res.text(); // Get raw text first

			if (!res.ok) {
				console.error(`API Error (${res.status}) on ${url}:`, text);
				return null;
			}

			try {
				return JSON.parse(text); // Try parsing JSON
			} catch (e) {
				console.error(`Invalid JSON from ${url}:`, text);
				return null; // Return null instead of crashing
			}
		} catch (error) {
			console.error(`Network Error on ${url}:`, error);
			return null;
		}
	};

	// --- FETCH: PROPERTIES ---
	useEffect(() => {
		async function fetchProperties() {
			if (!organizationId) return;
			const data = await safeFetch(`/api/properties?organizationId=${organizationId}`);
			if (data) {
				setMyProperties(data);
				setAvailableProperties(data.length);
				localStorage.setItem('dashboard_availableProperties', String(data.length));
			}
		}
		if (organizationId) fetchProperties();
	}, [organizationId, setAvailableProperties]);

	// --- FETCH: FINANCIAL SUMMARY (Ledger-based) ---
	useEffect(() => {
		async function fetchFinancialSummary() {
			if (!organizationId || !token) return;

			// Call the new GL-based API
			const data = await safeFetch(`/api/finance/summary`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (data && data.success) {
				setFinancials(data.data);
				localStorage.setItem('dashboard_financials', JSON.stringify(data.data));
			}
		}
		fetchFinancialSummary();
	}, [organizationId, token]);

	// --- EFFECT: CALCULATE OCCUPANCY ---
	useEffect(() => {
		async function fetchTenantApplications() {
			let propertyId = '';
			if (selectedProperty !== 'all') {
				const found = myproperties.find((p: any) => p.id === selectedProperty || getPropertyDisplayName(p) === selectedProperty);
				propertyId = found ? String(found.id) : String(selectedProperty);
			}
			const url = selectedProperty === 'all'
				? '/api/tenant-application'
				: `/api/tenant-application?propertyId=${propertyId}`;

			const data = await safeFetch(url);

			if (data && Array.isArray(data)) {
				setTenantApplications(data);
				const approvedCount = data.filter((app: any) => app.status === 'Approved' || app.status === 'APPROVED').length;
				setTenants(approvedCount);

				const totalUnits = Object.values(propertyUnits).reduce((sum, count) => sum + count, 0);
				const rate = totalUnits > 0 ? Math.round((approvedCount / totalUnits) * 100) : 0;

				setOccupancyRate(rate);
				localStorage.setItem(occupancyKey, String(rate));
			}
		}

		if (Object.keys(propertyUnits).length > 0) {
			fetchTenantApplications();
		}
	}, [propertyUnits, selectedProperty, myproperties, occupancyKey, setOccupancyRate]);

	// --- EFFECT: PROPERTY UNITS MAP ---
	useEffect(() => {
		if (myproperties && myproperties.length > 0) {
			const unitsMap: { [propertyId: string]: number } = {};
			myproperties.forEach((property: any) => {
				unitsMap[property.id] = Array.isArray(property.units) ? property.units.length : 0;
			});
			setPropertyUnits(unitsMap);
		}
	}, [myproperties]);

	// --- FETCH: MAINTENANCE ---
	useEffect(() => {
		async function fetchMaintenance() {
			if (!organizationId || !token) return;

			let propertyId = selectedProperty;
			if (selectedProperty !== 'all') {
				const found = myproperties.find((p: any) => p.id === selectedProperty || getPropertyDisplayName(p) === selectedProperty);
				if (found) propertyId = String(found.id);
			}

			const url = selectedProperty === 'all'
				? `/api/maintenance?organizationId=${organizationId}`
				: `/api/maintenance?organizationId=${organizationId}&propertyId=${propertyId}`;

			const data = await safeFetch(url, { headers: { Authorization: `Bearer ${token}` } });

			if (data && Array.isArray(data)) {
				const openRequests = data.filter((req: any) => req.status === 'OPEN');
				setPendingMaintenance(openRequests.length);
				localStorage.setItem('dashboard_pendingMaintenance', String(openRequests.length));

				openRequests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				setMaintenanceRequests(openRequests.slice(0, 5));
			} else {
				setMaintenanceRequests([]);
			}
		}
		fetchMaintenance();
	}, [selectedProperty, organizationId, token, myproperties, setPendingMaintenance]);

	// --- FETCH: STATS ---
	useEffect(() => {
		async function fetchStats() {
			if (!organizationId || !token) return;
			setLoading(true);

			let url: string;
			let propertyId = '';
			if (selectedProperty !== 'all') {
				const found = myproperties.find((p: any) => p.id === selectedProperty || getPropertyDisplayName(p) === selectedProperty);
				propertyId = found ? String(found.id) : String(selectedProperty);
				url = `/api/properties/stats?organizationId=${organizationId}&propertyId=${propertyId}`;
			} else {
				url = `/api/properties/stats?organizationId=${organizationId}`;
			}

			const data = await safeFetch(url, { headers: { Authorization: `Bearer ${token}` } });

			if (data) {
				setStats(data);
			}
			setLoading(false);
		}
		fetchStats();
	}, [selectedProperty, organizationId, token, myproperties]);

	// --- FETCH: LEASES ---
	useEffect(() => {
		async function fetchLeases() {
			if (!organizationId || !token) return;

			let propertyId = '';
			if (selectedProperty !== 'all') {
				const found = myproperties.find((p: any) => p.id === selectedProperty || getPropertyDisplayName(p) === selectedProperty);
				propertyId = found ? String(found.id) : String(selectedProperty);
			}

			const url = selectedProperty === 'all'
				? `/api/lease?organizationId=${organizationId}`
				: `/api/lease?organizationId=${organizationId}&propertyId=${propertyId}`;

			const data = await safeFetch(url, { headers: { Authorization: `Bearer ${token}` } });

			if (data && Array.isArray(data)) {
				setLeasesData(data);

				// Process upcoming leases
				const now = new Date();
				const sorted = data
					.filter((l: any) => l.endDate && new Date(l.endDate) > now)
					.sort((a: any, b: any) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
					.slice(0, 5)
					.map((lease: any) => {
						const end = new Date(lease.endDate!);
						const diffMs = end.getTime() - now.getTime();
						const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
						const diffMonths = Math.floor(diffDays / 30);

						let timeRemaining = diffMonths >= 1 ? `${diffMonths} month${diffMonths > 1 ? 's' : ''}` : `${diffDays} day${diffDays !== 1 ? 's' : ''}`;

						let propertyLabel = '';
						if (lease.property && typeof lease.property === 'object') {
							const prop = lease.property;
							propertyLabel = prop.apartmentComplexDetail?.buildingName || prop.houseDetail?.houseName || prop.name || '';
						} else if (lease.propertyName) {
							propertyLabel = lease.propertyName;
						} else if (lease.propertyId && myproperties.length > 0) {
							const found = myproperties.find((p: any) => p.id === lease.propertyId);
							if (found) propertyLabel = getPropertyDisplayName(found);
						}

						let unitLabel = lease.unitNumber || lease.unitName || lease.unit_number || (lease.unit && lease.unit.unitNumber) || '—';

						return {
							tenant: propertyLabel || '—',
							unit: unitLabel,
							timeRemaining,
							endDate: end.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
						};
					});
				setUpcomingLeases(sorted);
			}
		}
		fetchLeases();
	}, [selectedProperty, organizationId, token, myproperties]);

	// --- LOADING GUARD ---
	// If the auth context is still loading, show skeleton (prevents early rendering issues)
	if (authLoading && !user) {
		return (
			<div className="container mx-auto px-6 py-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</div>
		);
	}

	return (
		<div id="dashboard">
			<div className="relative z-20 container mx-auto px-6 py-2 bg-white">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-3">Dashboard Overview</h1>
					<p className="text-gray-600 text-lg mb-6">Monitor everything in one place.<br /></p>

					{/* Quick Actions and Property Selector */}
					<div className="mb-6">
						<div className="flex flex-row items-end justify-between gap-4 flex-wrap">
							<div className="inline-block">
								<label className="block text-sm font-medium text-gray-700 mb-2">Select Property</label>
								<div className="relative w-72">
									<select
										value={selectedProperty}
										onChange={(e) => setSelectedProperty(e.target.value)}
										className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
									>
										<option value="all">Properties available ( {myproperties.length} )</option>
										{myproperties.map((property) => (
											<option key={property.id} value={property.id}>
												{getPropertyDisplayName(property)}
											</option>
										))}
									</select>
									<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
								</div>
							</div>

							<div className="flex flex-col items-start">
								<span className="block text-lg font-semibold text-gray-800 mb-2">Quick actions</span>
								<div className="flex flex-row gap-3">
									<Link href="/property-manager/add-property">
										<button className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all">
											+ Add Property
										</button>
									</Link>
									<Link href="/property-manager/content/tenants">
										<button className="inline-flex items-center px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow transition-all">
											+ Add Tenant
										</button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Metrics Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{loading ? (
						<>
							<SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
						</>
					) : (
						<>
							<div className="bg-white rounded-xl shadow-2xl p-4">
								<div className="flex items-center gap-3 mb-2">
									<Home className="w-6 h-6 text-blue-600" />
									<p className="text-sm text-gray-600">Occupancy</p>
								</div>
								<p className="text-2xl font-semibold">{occupancyRate}% <small className="text-sm text-gray-400">({tenants} tenants)</small></p>
							</div>
							<div className="bg-white rounded-xl shadow-2xl p-4">
								<div className="flex items-center gap-3 mb-2">
									<DollarSign className="w-6 h-6 text-blue-600" />
									<p className="text-sm text-gray-600">Cash in Bank</p>
								</div>
								<p className="text-2xl font-semibold">${financials.cashInBank.toLocaleString()} <small className="text-xs text-red-500 font-normal">(${financials.outstandingArrears.toLocaleString()} Arrears)</small></p>
							</div>
							<div className="bg-white rounded-xl shadow-2xl p-4">
								<div className="flex items-center gap-3 mb-2">
									<Wrench className="w-6 h-6 text-blue-600" />
									<p className="text-sm text-gray-600">Pending Maintenance</p>
								</div>
								<p className="text-2xl font-semibold">{pendingMaintenance || 0}</p>
							</div>
							<UpcomingLeasesCard data={leasesData} />
						</>
					)}
				</div>

				{/* Chart Section */}
				{loading ? (
					<SkeletonBlock height="220px" className="my-8 w-full" />
				) : (
					<OccupancyLineChart selectedProperty={selectedProperty} myproperties={myproperties} />
				)}

				{/* Tables Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-18">
					{/* Upcoming Lease Renewals Table */}
					<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">Upcoming Lease Expiry Dates</h3>
							<Calendar className="text-purple-600" size={20} />
						</div>
						<div className="space-y-3">
							{loading ? (
								<><SkeletonListItem /><SkeletonListItem /><SkeletonListItem /></>
							) : upcomingLeases.length === 0 ? (
								<p className="text-gray-500 text-sm text-center py-4">No upcoming leases expiring soon</p>
							) : (
								upcomingLeases.slice(0, upcomingLeasesToShow).map((lease, index) => (
									<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
										<div className="flex-1">
											<p className="font-medium text-gray-900 text-sm">{lease.tenant}</p>
											<p className="text-xs text-gray-600">Unit {lease.unit} • {lease.timeRemaining} left • Expires {lease.endDate}</p>
										</div>
									</div>
								))
							)}
						</div>
						{upcomingLeasesToShow < upcomingLeases.length && (
							<button className="w-full mt-4 text-sm text-blue-600 font-medium" onClick={() => setUpcomingLeasesToShow(upcomingLeasesToShow + 5)}>View More Renewals →</button>
						)}
					</div>

					{/* Maintenance Table */}
					<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">Recent Maintenance Requests</h3>
							<AlertCircle className="text-orange-600" size={20} />
						</div>
						<div className="space-y-3">
							{loading ? (
								<><SkeletonListItem /><SkeletonListItem /><SkeletonListItem /></>
							) : maintenanceRequests.length === 0 ? (
								<p className="text-gray-500 text-sm text-center py-4">No pending maintenance requests</p>
							) : (
								maintenanceRequests.slice(0, maintenanceToShow).map((request, index) => (
									<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
										<div className="flex-1">
											<p className="font-medium text-gray-900 text-sm">{request.title || 'Untitled'}</p>
											<p className="text-xs text-gray-600">Priority: {request.priority}</p>
										</div>
										<span className={`text-xs px-3 py-1 rounded-full font-medium bg-gray-200`}>{request.status}</span>
									</div>
								))
							)}
						</div>
						{maintenanceToShow < maintenanceRequests.length && (
							<button className="w-full mt-4 text-sm text-blue-600 font-medium" onClick={() => setMaintenanceToShow(maintenanceToShow + 5)}>View More Requests →</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;