"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { ApexAxisChartSeries } from "apexcharts";
import { useMemo } from "react";

const DynamicReactApexChart = dynamic(() => import("react-apexcharts"), {
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

export default function AreaChart() {
  const series = useMemo<ApexAxisChartSeries>(
    () => [
      {
        name: "Series 1",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "Series 2",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    []
  );

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: "area",
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
      },
      title: {
        text: "Transactions Made",
        align: "left",
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
        labels: {
          datetimeUTC: false,
        },
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
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
      aria-label="Transactions chart"
    >
      <div className="h-[320px] w-full sm:h-[360px] lg:h-[40vh]">
        <DynamicReactApexChart
          options={options}
          series={series}
          type="area"
          width="100%"
          height="100%"
        />
      </div>
    </section>
  );
}
