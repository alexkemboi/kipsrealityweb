"use client"
import React, { useEffect, useState } from "react";
import Loading from "./loading";
import { Users, Calendar, AlertCircle, Home, Wrench, ChevronDown, TrendingUp, DollarSign } from 'lucide-react';
import { UpcomingLeasesCard } from './UpcomingLeasesCard';
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { CardContent } from "@/components/ui/card";
import OccupancyLineChart from "./OccupancyLineChart";
import Link from "next/link";


// Disable SSR for ApexCharts
const ColumnChart = dynamic(() => import("../../ApexCharts/ColumnChart"), { ssr: false });
const PieChart = dynamic(() => import("../../ApexCharts/PieChart"), { ssr: false });


const Dashboard = () => {

	type Properties = {
		id: string,
		name: string,
		city: string,
		units: number
	}

	interface Lease {
		endDate?: string;
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
	// Dynamic maintenance requests state
	const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);

	const { user } = useAuth();
	const organizationId = user?.organization?.id
	const [selectedProperty, setSelectedProperty] = useState('all');
	const [myproperties, setMyProperties] = useState<Properties[]>([])
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);;
	const [pendingMaintenance, setPendingMaintenance] = usePersistedNumber('dashboard_pendingMaintenance');
    const [occupancyRate, setOccupancyRate] = usePersistedNumber('dashboard_occupancyRate');
    const [rentCollected, setRentCollected] = usePersistedNumber('dashboard_rentCollected');
    const [availableProperties, setAvailableProperties] = usePersistedNumber('dashboard_availableProperties');
	const [ReactApexChart, setChart] = useState(null);
	const [propertyUnits, setPropertyUnits] = useState<{ [propertyId: string]: number }>({});
	const [tenantApplications, setTenantApplications] = useState([]);
	const [stats, setStats] = useState<any>({});
	const [leasesData, setLeasesData] = useState<Lease[]>([]);
	const [upcomingLeases, setUpcomingLeases] = useState<any[]>([]);
	const [tenants, setTenants] = useState(0);
	// Compute and sort upcoming expiring leases
	useEffect(() => {
		if (!leasesData || leasesData.length === 0) {
			setUpcomingLeases([]);
			return;
		}
		// Filter leases with endDate in the future, sort by soonest
		const now = new Date();
		const sorted = leasesData
			.filter(l => l.endDate && new Date(l.endDate) > now)
			.sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
			.slice(0, 5)
			.map(lease => {
				// Calculate time remaining
				const end = new Date(lease.endDate!);
				const diffMs = end.getTime() - now.getTime();
				const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
				const diffMonths = Math.floor(diffDays / 30);
				let timeRemaining = '';
				if (diffMonths >= 1) {
					timeRemaining = `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
				} else {
					timeRemaining = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
				}
				// Get tenant name, unit name or number
								// Show property name as the main label (top), and unit name/number as the secondary label (bottom)
								let propertyLabel = '';
								if ((lease as any).property && typeof (lease as any).property === 'object' && (lease as any).property.name) {
									propertyLabel = (lease as any).property.name;
								} else if ((lease as any).propertyName) {
									propertyLabel = (lease as any).propertyName;
								} else if ((lease as any).propertyId && myproperties.length > 0) {
									const found = myproperties.find((p: any) => p.id === (lease as any).propertyId);
									if (found) propertyLabel = String(found.name);
								}
								let unitLabel = (lease as any).unitNumber || (lease as any).unitName || (lease as any).unit_number || (lease as any).unit || '—';
								return {
										tenant: propertyLabel || '—', // property name on top
										unit: unitLabel, // unit name/number below
										timeRemaining,
										endDate: end.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
								};
			});
		setUpcomingLeases(sorted);
	}, [leasesData]);

	// Fetch tenant applications and calculate occupancy rate (combined)
useEffect(() => {

	async function fetchTenantApplications() {
		try {
			let propertyId = '';
			if (selectedProperty !== 'all') {
				// Always resolve the propertyId from myproperties
				const found = myproperties.find((p: any) => p.id === selectedProperty || p.name === selectedProperty);
				if (found) {
					propertyId = String(found.id);
				} else {
					// fallback: use selectedProperty as id if not found
					propertyId = String(selectedProperty);
				}
			}
			const url = selectedProperty === 'all'
				? '/api/tenant-application'
				: `/api/tenant-application?propertyId=${propertyId}`;

			const res = await fetch(url);
			if (!res.ok) {
				setTenantApplications([]);
				setOccupancyRate(undefined);
				localStorage.setItem('dashboard_occupancyRate', '');
				return;
			}

			const data = await res.json();
			setTenantApplications(data);

			// Count approved applications
			const approvedCount = Array.isArray(data)
				? data.filter(app =>
					  app.status === 'Approved' || app.status === 'APPROVED'
				  ).length
				: 0;
			setTenants(approvedCount);
			// Total units (sum across all properties)
			const totalUnits = Object.values(propertyUnits).reduce(
				(sum, count) => sum + count,
				0
			);

			// Calculate occupancy rate
			const rate =
				totalUnits > 0
					? Math.round((approvedCount / totalUnits) * 100)
					: 0;

			setOccupancyRate(rate);
			localStorage.setItem('dashboard_occupancyRate', String(rate));

		} catch (error) {
			console.error('Error fetching tenant applications:', error);
			setOccupancyRate(undefined);
			localStorage.setItem('dashboard_occupancyRate', '');
		}
	}

    // Only run if propertyUnits is populated
    if (Object.keys(propertyUnits).length > 0) {
        fetchTenantApplications();
    }
}, [propertyUnits, selectedProperty, myproperties]);



	useEffect(() => {
		if (myproperties && myproperties.length > 0) {
			const unitsMap: { [propertyId: string]: number } = {};
			myproperties.forEach((property: any) => {
				unitsMap[property.id] = Array.isArray(property.units) ? property.units.length : 0;
			});
			setPropertyUnits(unitsMap);
		}
	}, [myproperties]);

	// Retrieve token from localStorage on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedTokens = localStorage.getItem('rentflow_tokens');
			console.log('[Dashboard] Checking localStorage for rentflow_tokens:', !!storedTokens);
			if (storedTokens) {
				try {
					// Try to parse as JSON first
					let token = null;
					try {
						const parsed = JSON.parse(storedTokens);
						// If it's an object with accessToken property, use that
						if (parsed && typeof parsed === 'object' && parsed.accessToken) {
							token = parsed.accessToken;
						} else {
							// Otherwise, treat the whole thing as the token (it's a JWT string)
							token = storedTokens;
						}
					} catch {
						// If JSON.parse fails, it's probably a raw JWT token string
						token = storedTokens;
					}

					console.log('[Dashboard] Token extracted:', !!token);
					if (token) {
						console.log('[Dashboard] Setting token state with:', token.substring(0, 20) + '...');
						setToken(token);
					} else {
						console.warn('[Dashboard] No valid token found');
						setToken(null);
					}
				} catch (error) {
					console.error('[Dashboard] Error processing token:', error);
					setToken(null);
				}
			} else {
				console.warn('[Dashboard] No rentflow_tokens found in localStorage');
				setToken(null);
			}
		}
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setChart(() => require("react-apexcharts").default);
		}
	}, []);

	useEffect(() => {
		async function fetchProperties() {
			if (!organizationId) return;
			try {
				const res = await fetch(`/api/properties?organizationId=${organizationId}`);
				if (!res.ok) {
					setMyProperties([]);
					return;
				}
				const data = await res.json();
				setMyProperties(data);
			} catch (error) {
				console.error("Error fetching properties:", error)
			}
		}
		fetchProperties();
	}, [organizationId])

	// Fetch maintenance requests and count OPEN status, and store OPEN requests for display
useEffect(() => {
    async function fetchMaintenance() {
        if (!organizationId || !token) {
            console.log('[Dashboard] Waiting for token/orgId to fetch maintenance');
            return;
        }

        try {
			let propertyId = selectedProperty;
			if (selectedProperty !== 'all') {
				// If selectedProperty is a name, find the property object and use its id
				const found = myproperties.find(
					(p: any) => p.id === selectedProperty || p.name === selectedProperty
				);
				if (found) {
					propertyId = String(found.id);
				}
			}
			const url = selectedProperty === 'all'
				? `/api/maintenance?organizationId=${organizationId}`
				: `/api/maintenance?organizationId=${organizationId}&propertyId=${propertyId}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                setPendingMaintenance(undefined);
                localStorage.setItem('dashboard_pendingMaintenance', '');
                setMaintenanceRequests([]);
                return;
            }

            const data = await res.json();
            console.log('[Dashboard] Maintenance requests fetched:', data);

            // Filter OPEN requests
            const openRequests = Array.isArray(data)
                ? data.filter(req => req.status === 'OPEN')
                : [];

            const openCount = openRequests.length;

            setPendingMaintenance(openCount);
            localStorage.setItem('dashboard_pendingMaintenance', String(openCount));

            // Sort by createdAt descending (most recent first)
            openRequests.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setMaintenanceRequests(openRequests.slice(0, 5)); // Show only 5 most recent

        } catch (error) {
            console.error('Error fetching maintenance requests:', error);

            // State updates
            setMaintenanceRequests([]);
            setPendingMaintenance(undefined);

            // LocalStorage clear
            localStorage.setItem('dashboard_pendingMaintenance', '');
        }
    }

    if (organizationId && token) {
        fetchMaintenance();
    }
}, [selectedProperty, organizationId, token]);


	// Fetch stats when property selection changes
	useEffect(() => {
		async function fetchStats() {
			console.log('[Dashboard] fetchStats called. organizationId:', organizationId, 'token:', !!token);
			if (!organizationId || !token) {
				console.log('[Dashboard] Skipping fetchStats - missing organizationId or token');
				return;
			}
			setLoading(true);
			try {
				let url: string;
				let propertyId = '';
				if (selectedProperty !== 'all') {
					const found = myproperties.find((p: any) => p.id === selectedProperty || p.name === selectedProperty);
					if (found) {
						propertyId = String(found.id);
					} else {
						propertyId = String(selectedProperty);
					}
				}
				if (selectedProperty === 'all') {
					url = `/api/properties/stats?organizationId=${organizationId}`;
					console.log(`[Dashboard] Fetching all properties stats from: ${url}`);
				} else {
					url = `/api/properties/stats?organizationId=${organizationId}&propertyId=${propertyId}`;
					console.log(`[Dashboard] Fetching property ${propertyId} stats from: ${url}`);
				}

				console.log('[Dashboard] Sending Authorization header with token:', token.substring(0, 20) + '...');
				const res = await fetch(url, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					// Gracefully handle error without throwing
					setRentCollected(undefined);
					setStats({});
					setLoading(false);
					return;
				}

				const data = await res.json();
				console.log('[Dashboard] Stats received:', data);
				setStats(data);
				if (typeof data.totalRentCollected === 'number') {
					setRentCollected(data.totalRentCollected);
					localStorage.setItem('dashboard_rentCollected', String(data.totalRentCollected));
				} else {
					setRentCollected(undefined);
				}
			} catch (error) {
				console.error("[Dashboard] Error fetching dashboard stats:", error);
				setRentCollected(undefined);
			} finally {
				setLoading(false);
			}
		}

		if (organizationId && token) {
			console.log('[Dashboard] Dependency change detected - calling fetchStats');
			fetchStats();
		}
	}, [selectedProperty, organizationId, token, myproperties]);

	// Fetch available properties count
useEffect(() => {
    async function fetchAvailableProperties() {
        if (!organizationId || !token) {
            console.log('[Dashboard] Waiting for organizationId/token for properties count');
            return;
        }

        try {
            console.log(`[Dashboard] Fetching properties for org: ${organizationId}`);
            const res = await fetch(`/api/properties?organizationId=${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                setAvailableProperties(undefined);
                localStorage.setItem('dashboard_availableProperties', ''); // clear value
                return;
            }

            const data = await res.json();
            console.log(`[Dashboard] Fetched ${data.length} properties:`, data);

            const count = data.length || 0;

            setAvailableProperties(count);
            localStorage.setItem('dashboard_availableProperties', String(count));

        } catch (error) {
            console.error("[Dashboard] Error fetching available properties:", error);
            setAvailableProperties(undefined);
            localStorage.setItem('dashboard_availableProperties', '');
        }
    }

    if (organizationId && token) {
        fetchAvailableProperties();
    }
}, [organizationId, token]);

	// Fetch upcoming leases
	useEffect(() => {
		async function fetchLeases() {
			if (!organizationId || !token) {
				console.log('[Dashboard] Waiting for token/orgId to fetch leases');
				return;
			}
			try {
				let propertyId = '';
				if (selectedProperty !== 'all') {
					const found = myproperties.find((p: any) => p.id === selectedProperty || p.name === selectedProperty);
					if (found) {
						propertyId = String(found.id);
					} else {
						propertyId = String(selectedProperty);
					}
				}
				const url = selectedProperty === 'all'
					? `/api/lease?organizationId=${organizationId}`
					: `/api/lease?organizationId=${organizationId}&propertyId=${propertyId}`;
				const res = await fetch(url, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!res.ok) {
					setLeasesData([]);
					return;
				}
				const data = await res.json();
				console.log('[Dashboard] Leases fetched:', data);
				setLeasesData(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error('Error fetching upcoming leases:', error);
				setLeasesData([]);
			}
		}

		if (organizationId && token) {
			fetchLeases();
		}
	}, [selectedProperty, organizationId, token, myproperties]);

	
	return (
		<div id="dashboard">
			{/* Main Content */}
			<div className="relative z-20 container mx-auto px-6 py-2 bg-white">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-3">Dashboard Overview</h1>
					<p className="text-gray-600 text-lg mb-6">
						Monitor everything in one place.
						<br />
					</p>

					{/* Quick Actions and Property Selector Row */}
					<div className="mb-6">
						<div className="flex flex-row items-end justify-between gap-4 flex-wrap">
							{/* Property Selector */}
							<div className="inline-block">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Select Property
								</label>
								<div className="relative w-72">
									<select
										value={selectedProperty}
										onChange={(e) => setSelectedProperty(e.target.value)}
										className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
									>
										{/* Default "All Properties" option */}
										<option value="all">Properties available ( {myproperties.length} )</option>
										{myproperties.map((property) => (
											<option key={property.id.toString()} value={property.id.toString()} className="z-50">
												{property.name}
											</option>
										))}
									</select>
									<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
								</div>
							</div>
							{/* Action Buttons with label above */}
							<div className="flex flex-col items-start">
								<span className="block text-lg font-semibold text-gray-800 mb-2">Quick actions</span>
								<div className="flex flex-row gap-3">
									<Link href="/property-manager/add-property" passHref>
										<button
											className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
											type="button"
										>
											+ Add Property
										</button>
									</Link>
									<Link href="/property-manager/content/invites" passHref>
										<button
											className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
											type="button"
										>
											+ Add Tenant
										</button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Metrics Section */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">


					{/* Occupancy Rate — Home Icon */}
					<div className="bg-white rounded-xl shadow-2xl p-4">
						<div className="flex items-center gap-3 mb-2">
							
								 <Home
                                    className="w-6 h-6 text-blue-600 drop-shadow-lg"
                                    style={{ filter: 'drop-shadow(0 2px 6px #3b82f6aa)' }}
                                />
							
							<p className="text-sm text-gray-600">Occupancy</p>
						</div>
						<p className="text-2xl font-semibold">{occupancyRate}% <small className="text-sm text-gray-400">{`(${tenants} tenants)`}</small></p>
					</div>

					{/* Rent Collected — DollarSign Icon */}
					<div className="bg-white rounded-xl shadow-2xl p-4">
						<div className="flex items-center gap-3 mb-2">
							
								<DollarSign className="w-6 h-6 text-blue-600 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 6px #a78bfaaa)' }} />
							
							<p className="text-sm text-gray-600">Rent Collected</p>
						</div>
						<p className="text-2xl font-semibold">
                          {rentCollected !== undefined ? `$${rentCollected.toLocaleString()}` : 0}
                        </p>
					</div>

					{/* Pending Maintenance — Wrench Icon */}
					<div className="bg-white rounded-xl shadow-2xl p-4">
						<div className="flex items-center gap-3 mb-2">
							
								<Wrench className="w-6 h-6  text-blue-600 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 6px #ec4899aa)' }} />
							
							<p className="text-sm text-gray-600">Pending Maintenance</p>
						</div>
						<p className="text-2xl font-semibold">{pendingMaintenance}</p>
					</div>

					{/* Lease Expirations — Calendar Icon */}
					<UpcomingLeasesCard data={leasesData} />
				</div>
								<OccupancyLineChart selectedProperty={selectedProperty} myproperties={myproperties} />

				{/* Tables Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-18">
					{/* Upcoming Lease Renewals */}
					<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">Upcoming Lease Expiry Dates</h3>
							<Calendar className="text-purple-600" size={20} />
						</div>
						<div className="space-y-3">
							{upcomingLeases.length === 0 ? (
								<p className="text-gray-500 text-sm text-center py-4">No upcoming leases expiring soon</p>
							) : (
								upcomingLeases.map((lease, index) => (
									<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
										<div className="flex-1">
											<p className="font-medium text-gray-900 text-sm">
												{typeof lease.tenant === 'object' && lease.tenant !== null
													? (lease.tenant.firstName || '') + ' ' + (lease.tenant.lastName || lease.tenant.email || '')
													: lease.tenant}
											</p>
											<p className="text-xs text-gray-600">
												Unit {
													typeof lease.unit === 'object' && lease.unit !== null
														? (lease.unit.unitNumber || lease.unit.unitName || JSON.stringify(lease.unit))
														: lease.unit
												} • {lease.timeRemaining} left • Expires {lease.endDate}
											</p>
										</div>
									</div>
								))
							)}
						</div>
						<button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
							View All Renewals →
						</button>
					</div>

					{/* Recent Maintenance Requests */}
					<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">Recent Maintenance Requests</h3>
							<AlertCircle className="text-orange-600" size={20} />
						</div>
						<div className="space-y-3">
							{maintenanceRequests.length === 0 ? (
								<p className="text-gray-500 text-sm text-center py-4">No pending maintenance requests</p>
							) : (
								maintenanceRequests.map((request, index) => {
									// Calculate how long ago
									let ago = '';
									if (request.createdAt) {
										const now = new Date();
										const created = new Date(request.createdAt);
										const diffMs = now.getTime() - created.getTime();
										const diffMins = Math.floor(diffMs / (1000 * 60));
										const diffHours = Math.floor(diffMins / 60);
										const diffDays = Math.floor(diffHours / 24);
										if (diffDays > 0) {
											ago = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
										} else if (diffHours > 0) {
											ago = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
										} else if (diffMins > 0) {
											ago = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
										} else {
											ago = 'just now';
										}
									}
									// Get property name and unit
									let propertyName = '';
									if (request.property && typeof request.property === 'object' && request.property.name) {
										propertyName = request.property.name;
									} else if (request.propertyName) {
										propertyName = request.propertyName;
									}
									let unitLabel = '';
									if (request.unitNumber) {
										unitLabel = request.unitNumber;
									} else if (request.unitName) {
										unitLabel = request.unitName;
									} else if (request.unit_number) {
										unitLabel = request.unit_number;
									} else if (request.unit) {
										if (typeof request.unit === 'object' && request.unit !== null) {
											unitLabel = request.unit.unitNumber || request.unit.unitName || JSON.stringify(request.unit);
										} else {
											unitLabel = request.unit;
										}
									}
									return (
										<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
											<div className="flex-1">
												<p className="font-medium text-gray-900 text-sm">{request.title || request.issue || 'Untitled Request'}</p>
												<p className="text-xs text-gray-600">{propertyName}{unitLabel ? ` • Unit ${unitLabel}` : ''} • {ago}</p>
											</div>
											<span className={`text-xs px-3 py-1 rounded-full font-medium ${request.priority === 'HIGH' || request.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
													request.priority === 'LOW' || request.priority === 'NORMAL' ? 'bg-orange-100 text-orange-700' :
														'bg-gray-200 text-gray-700'
												}`}>
												{request.priority || (request.priority_level ? request.priority_level : '—')}
											</span>
										</div>
									);
								})
							)}
						</div>
						<button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
							View All pending Requests →
						</button>
					</div>
				</div>
			</div>	
		</div>

	);
};

export default Dashboard;
