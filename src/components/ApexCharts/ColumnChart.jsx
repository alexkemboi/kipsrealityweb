"use client"

import React from "react";
import Chart from "react-apexcharts";

class ColumnChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: 'Net Profit',
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
        },
        {
          name: 'Revenue',
          data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
        },
        {
          name: 'Free Cash Flow',
          data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
        },
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        },
        yaxis: {
          title: {
            text: '$ (thousands)',
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " thousands";
            },
          },
        },
        title: {
          text: "Loans",
        },
      },
    };
  }

  render() {
    return (
      <div className='w-full shadow-lg  md:col-span-1 relative lg:h-[40vh] h-[40vh] m-auto  px-2  border rounded-lg bg-[#ffffff]'>
        <div className='h-full w-auto sm:w-full sm:h-full'>
          <Chart options={this.state.options} series={this.state.series} type="bar" height="100%" width="100%" />
        </div>
      </div>
    );
  }
}



export default ColumnChart;