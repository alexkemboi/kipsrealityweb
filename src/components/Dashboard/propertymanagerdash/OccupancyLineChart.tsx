import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import RentUtilitiesChart from "./RentUtilitiesChart";

// Utility: generate color palette
const COLORS = [
	"#4F46E5", "#60A5FA", "#F59E42", "#10B981", "#EF4444", "#A78BFA", "#F472B6", "#FBBF24", "#34D399", "#6366F1"
];

interface OccupancyLineChartProps {
	selectedProperty: string;
	myproperties: Array<{ id: string; name?: string }>;
}

const OccupancyLineChart: React.FC<OccupancyLineChartProps> = ({ selectedProperty, myproperties }) => {
	const [chartData, setChartData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);


	useEffect(() => {
		async function fetchOccupancyHistory() {
			setLoading(true);
			try {
				if (selectedProperty === "all") {
					const propertyIds = myproperties.map(p => p.id);
					const res = await fetch(`/api/occupancy-history?propertyIds=${propertyIds.join(",")}`);
					const data = await res.json();
					// Group by month/year, each propertyId as a separate line
					const grouped: { [key: string]: any } = {};
					data.forEach((row: any) => {
						const key = `${row.year}-${row.month}`;
						if (!grouped[key]) {
							grouped[key] = {
								month: new Date(row.year, row.month - 1).toLocaleString('default', { month: 'short' }),
								year: row.year,
							};
						}
						// Always use propertyId as key
						grouped[key][row.propertyId] = Number(row.occupancyRate);
					});
					const sorted = Object.values(grouped).sort((a: any, b: any) => {
						if (a.year !== b.year) return a.year - b.year;
						return new Date(`${a.year}-${a.month}-01`).getMonth() - new Date(`${b.year}-${b.month}-01`).getMonth();
					});
					setChartData(sorted);
					// Debug log
					console.log("[OccupancyLineChart] chartData:", sorted);
				} else {
					const res = await fetch(`/api/occupancy-history?propertyId=${selectedProperty}`);
					const data = await res.json();
					const formatted = data.map((row: any) => ({
						month: new Date(row.year, row.month - 1).toLocaleString('default', { month: 'short' }),
						year: row.year,
						occupancyRate: Number(row.occupancyRate),
					}));
					setChartData(formatted);
					console.log("[OccupancyLineChart] chartData (single):", formatted);
				}
			} catch (err) {
				setChartData([]);
			} finally {
				setLoading(false);
			}
		}
		fetchOccupancyHistory();
	}, [selectedProperty, myproperties]);

	// Helper to get display name for a property
	function getPropertyDisplayName(property: { name?: string; apartmentComplexDetail?: { buildingName?: string } | null; houseDetail?: { houseName?: string } | null }): string {
		return property?.apartmentComplexDetail?.buildingName || property?.houseDetail?.houseName || property?.name || '';
	}

	// Get property IDs for lines
	const propertyIds = selectedProperty === "all"
		? myproperties.map(p => p.id)
		: [];
	console.log("[OccupancyLineChart] propertyIds:", propertyIds);

	// Ensure myproperties passed to RentUtilitiesChart always has name as string
	const safeMyProperties = myproperties.map(p => ({
		...p,
		name: p.name ?? ''
	}));

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
			<CardContent className="p-0 flex flex-col justify-center min-h-[300px]">
				<div className="mb-4">
					<h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
				</div>
				<div className="w-full overflow-x-auto custom-scrollbar pb-2">
					<div style={{ minWidth: "100%", width: Math.max(600, chartData.length * 60) }}>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart
								data={chartData}
								margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									interval={0}
									minTickGap={0}
									padding={{ left: 10, right: 10 }}
								/>
								<YAxis domain={[0, 100]} tickFormatter={tick => `${tick}%`} />
								<Tooltip />
								<Legend formatter={(value) => {
									const prop = myproperties.find(p => p.id === value);
									return prop ? getPropertyDisplayName(prop) : value;
								}} />
								{selectedProperty === "all"
									? myproperties.map((property, idx) => (
										<Line
											key={property.id}
											type="monotone"
											dataKey={property.id}
											name={getPropertyDisplayName(property)}
											stroke={COLORS[idx % COLORS.length] || "#000"}
											strokeWidth={3}
											dot={false}
										/>
									))
									: (
										<Line
											type="monotone"
											dataKey="occupancyRate"
											stroke="#4F46E5"
											strokeWidth={3}
											dot={false}
										/>
									)}
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			</CardContent>
			<div className="h-full min-h-[300px]">
				<RentUtilitiesChart selectedProperty={selectedProperty} myproperties={safeMyProperties} />
			</div>
		</div>
	);
};

export default OccupancyLineChart;
