"use client"
import React, { Component } from "react";
import Chart from "react-apexcharts";

class PieChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            series: [
              60,100,200
              ],
            options: {
                chart: {
                    width: "100%",
                    type: 'donut',
                },
                plotOptions: {
                    pie: {
                        startAngle: -90,
                        endAngle: 270
                    }
                },
                dataLabels: {
                    enabled: true
                },
                fill: {
                    type: 'gradient',
                },
                legend: {
                    formatter: function (val, opts) {
                        return val + " - " + opts.w.globals.series[opts.seriesIndex]
                    }
                },
                title: {
                    text: 'Product overview'
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: "100%"
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            },


        };
    }



    render() {
        return (


            <div className='w-full shadow-lg  md:col-span-1 relatiive lg:h-[40vh] h-[40vh] m-auto  px-2  border rounded-lg bg-[#ffffff]'>
                <div className='h-full w-auto sm:w-full sm:h-full'>
                    <Chart options={this.state.options} series={this.state.series} type="donut" width="100%" height="100%" />
                </div>
            </div>


        );
    }
}

export default PieChart;