"use client"
import React, { useEffect, useState } from 'react';


const BarChart= () => {
  const [ReactApexChart, setChart] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setChart(() => require("react-apexcharts").default);
    }
  }, []);
  const options = {
    chart: {
      id: 'basic-bar',
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
      axisTicks: {
        color: '#333',
      },
      axisBorder: {
        color: '#333',
      },
    },
    colors: [
      ( value ) => (value < 55 ? '#7E36AF' : '#D9534F'),
      ( value ) => (value < 111 ? '#7E36AF' : '#D9534F'),
    ],
    grid: {},
    tooltip: {
      theme: 'dark',
      x: {
        formatter: () => 'HH:mm:ss',
      },
    },
    title: {
      text: 'Reports',
      align: 'left',
      style: {
        fontSize: '12px',
      },
    },
  };

  const series = [
    {
      name: 'series-1',
      data: [30, 40, 45, 50, 49, 60, 70, 91],
    },
  ];

  return (
    <div className='w-full shadow-lg md:col-span-1 relative lg:h-[40vh] h-[40vh] mx-auto px-2 border rounded-lg bg-[#ffffff]'>
      <div className='h-full w-auto sm:w-full sm:h-full'>
        {ReactApexChart && <ReactApexChart
          options={options}
          series={series}
          type='bar'
          width='100%'
          height='100%'
        />}
      </div>
    </div>
  );
};

export default BarChart;
