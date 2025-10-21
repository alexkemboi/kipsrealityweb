"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import TopCards from "./TopCards";

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

	return (
		<section
			id="dashboard"
			className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300"
		>
			{/* Background Layers */}
			<div className="absolute inset-0 z-0">
				{/* Base Background */}
				<div className="absolute inset-0 bg-[var(--color-blue-50)]" />

				{/* Gradient Overlays */}
				<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-blue-100)]/80 via-transparent to-[var(--color-cyan-50)]/60" />
				<div className="absolute inset-0 bg-gradient-to-r from-[var(--color-blue-100)]/40 via-transparent to-[var(--color-cyan-100)]/40" />

				{/* Grid Overlay */}
				<div className="absolute inset-0 opacity-[0.03]">
					<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
				</div>

				{/* Floating Orbs */}
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/15 rounded-full blur-3xl animate-float-slow" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl animate-float-medium delay-2000" />
				<div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-200/8 rounded-full blur-3xl animate-float-slow delay-1000" />
			</div>

			{/* Main Content */}
			<div className="relative z-20 container mx-auto px-6 py-24 lg:py-32">
				<div className="max-w-7xl mx-auto space-y-10">
					{/* Top Summary Cards */}
					<div className="bg-white/50 backdrop-blur-xl border border-blue-200/30 rounded-3xl p-6 shadow-lg hover:shadow-blue-300/20 transition-all duration-500">
						<TopCards />
					</div>

					{/* Charts Grid */}
					<div className="flex flex-col md:flex-row gap-8">
						{/* Pie Chart */}
						<div className="w-full bg-white/50 backdrop-blur-xl border border-blue-200/30 rounded-3xl p-6 shadow-lg hover:shadow-blue-300/20 transition-all duration-500 hover:scale-[1.02]">
							<h4 className="text-[var(--color-blue-700)] font-semibold mb-4 text-center text-lg">
								Property Distribution
							</h4>
							<div className="relative h-[40vh] flex justify-center items-center">
								<PieChart />
							</div>
						</div>

						{/* Column Chart */}
						<div className="w-full bg-white/50 backdrop-blur-xl border border-blue-200/30 rounded-3xl p-6 shadow-lg hover:shadow-cyan-300/20 transition-all duration-500 hover:scale-[1.02]">
							<h4 className="text-[var(--color-cyan-700)] font-semibold mb-4 text-center text-lg">
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
