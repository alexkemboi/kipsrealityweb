"use client"
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import TopCards from "./TopCards";

import { AreaChart } from "lucide-react";
import dynamic from "next/dynamic";

// Disable SSR for ApexCharts
const ColumnChart = dynamic(() => import("../../ApexCharts/ColumnChart"), { ssr: false });
const PieChart = dynamic(() => import("../../ApexCharts/PieChart"), { ssr: false });

const Dashboard = () => {

	const [ReactApexChart, setChart] = useState(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setChart(() => require("react-apexcharts").default);
		}
	}, []);
	useEffect(() => {
		if (typeof window !== "undefined") {
			setChart(() => require("react-apexcharts").default);
		}
	}, [])
	return (
		<section
			id="dashboard"
			className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]"
		>

			{/* Main Content */}
			<div className="relative z-20 container mx-auto px-6 py-24 lg:py-32 bg-[#0f172a]">
				<div className="max-w-7xl mx-auto space-y-10 bg-[#0f172a]">
					{/* Top Summary Cards */}
					<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
						<TopCards />
					</div>

					{/* Charts Grid */}
					<div className="flex flex-col md:flex-row gap-8">
						{/* Pie Chart */}
						<div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
							<h4 className="text-white font-semibold mb-4 text-center text-lg">
								Property Distribution
							</h4>
							<div className="relative h-[40vh] flex justify-center items-center">
								<PieChart />
							</div>
						</div>

						{/* Column Chart */}
						<div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02]">
							<h4 className="text-white font-semibold mb-4 text-center text-lg">
								Revenue Overview
							</h4>
							<div className="relative h-[40vh] flex justify-center items-center">
								<ColumnChart />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

	);
};

export default Dashboard;
