import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import RentUtilitiesChart from "./RentUtilitiesChart";


const OccupancyLineChart: React.FC = () => {
	const [occupancyData, setOccupancyData] = useState<Array<{ month: string; year: number; occupancyRate: number }>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchOccupancyHistory() {
			setLoading(true);
			try {
				const res = await fetch("/api/occupancy-history");
				const data = await res.json();
				// Transform data to chart format
				const formatted = data.map((row: any) => ({
					month: new Date(row.year, row.month - 1).toLocaleString('default', { month: 'short' }),
					year: row.year,
					occupancyRate: Number(row.occupancyRate),
				}));
				setOccupancyData(formatted);
			} catch (err) {
				setOccupancyData([]);
			} finally {
				setLoading(false);
			}
		}
		fetchOccupancyHistory();
	}, []);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
			<CardContent className="p-6 flex flex-col justify-center">
				<div className="w-full overflow-x-auto" style={{ height: 220 }}>
					<div style={{ minWidth: 600, width: Math.max(600, occupancyData.length * 60) }}>
						<ResponsiveContainer width={Math.max(600, occupancyData.length * 60)} height={200}>
							<LineChart
								data={occupancyData}
								margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
							>
								<defs>
									<linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8} />
										<stop offset="100%" stopColor="#60A5FA" stopOpacity={0.2} />
									</linearGradient>
								</defs>
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
								<Line
									type="monotone"
									dataKey="occupancyRate"
									stroke="#4F46E5"
									strokeWidth={3}
									dot={false}
									fill="url(#rentGradient)"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			</CardContent>
			<div className="flex flex-col justify-center items-center h-[220px]">
				<RentUtilitiesChart />
			</div>
		</div>
	);
};

export default OccupancyLineChart;
