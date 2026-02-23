"use client";

import dynamic from "next/dynamic";
import type { ApexAxisChartSeries, ApexOptions } from "apexcharts";
import { useMemo } from "react";

const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[280px] items-center justify-center text-sm text-gray-500"
      role="status"
      aria-live="polite"
    >
      Loading chart...
    </div>
  ),
});

export default function ColumnChart() {
  const series = useMemo<ApexAxisChartSeries>(
    () => [
      {
        name: "Net Profit",
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
      },
      {
        name: "Revenue",
        data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
      },
      {
        name: "Free Cash Flow",
        data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
      },
    ],
    []
  );

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      title: {
        text: "Loans",
        align: "left",
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 4, // modern alternative to endingShape
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      },
      yaxis: {
        title: {
          text: "$ (thousands)",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `$ ${val} thousands`,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 3,
      },
      noData: {
        text: "No chart data available",
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 300 },
            legend: {
              position: "bottom",
              horizontalAlign: "center",
            },
          },
        },
      ],
    }),
    []
  );

  return (
    <section
      className="relative mx-auto w-full rounded-lg border bg-white px-2 shadow-lg md:col-span-1"
      aria-label="Loans bar chart"
    >
      <div className="h-[320px] w-full sm:h-[360px] lg:h-[40vh]">
        <ApexChart
          options={options}
          series={series}
          type="bar"
          width="100%"
          height="100%"
        />
      </div>
    </section>
  );
}
