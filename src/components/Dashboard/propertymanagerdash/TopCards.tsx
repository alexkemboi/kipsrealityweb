"use client"
import React from 'react'



const TopCards = () => {
    return (
        <div className="grid lg:grid-cols-8 gap-4 py-4 sm:w-full bg-transparent">

            {/* Properties Available Card */}
            <div className="lg:col-span-2 col-span-1 shadow-lg bg-[#F5F5F5] flex justify-between w-full border rounded-lg hover:shadow-md hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-blue-400 border-r-4">
                <div className="flex flex-col justify-center w-full m-4">
                    <p className="text-blue-900 text-sm font-bold">Properties Available</p>
                    <div className="flex w-auto h-1 mt-2">
                        <div className="bg-blue-200 w-3/4 h-1"></div>
                        <div className="bg-gray-50 w-1/4 h-1"></div>
                    </div>
                </div>
                <p className="bg-blue-200 flex justify-center items-center p-2">
                    <span className="text-sm font-bold text-blue-900">120</span>
                </p>
            </div>

            {/* Leases Active Card */}
            <div className="lg:col-span-2 col-span-1 shadow-lg bg-[#F5F5F5] flex justify-between w-full border rounded-lg hover:shadow-md hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-red-400 border-r-4">
                <div className="flex flex-col justify-center w-full m-4">
                    <p className="text-blue-900 text-sm font-bold">Active Leases</p>
                    <div className="flex w-auto h-1 mt-2">
                        <div className="bg-red-200 w-1/2 h-1"></div>
                        <div className="bg-gray-50 w-1/2 h-1"></div>
                    </div>
                </div>
                <p className="bg-red-200 flex justify-center items-center p-2">
                    <span className="text-sm font-bold text-blue-900">85</span>
                </p>
            </div>

            {/* Tenants Card */}
            <div className="lg:col-span-2 col-span-1 shadow-lg bg-[#F5F5F5] flex justify-between w-full border rounded-lg hover:shadow-md hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-green-500 border-r-4">
                <div className="flex flex-col justify-center w-full pb-4 m-4">
                    <p className="text-blue-900 text-sm font-bold">Tenants</p>
                    <div className="flex w-auto h-1 mt-2">
                        <div className="bg-green-200 w-2/3 h-1"></div>
                        <div className="bg-gray-50 w-1/3 h-1"></div>
                    </div>
                </div>
                <p className="bg-green-200 flex justify-center items-center p-2">
                    <span className="text-sm font-bold text-blue-900">300</span>
                </p>
            </div>

            {/* Overdue Payments Card */}
            <div className="lg:col-span-2 col-span-1 shadow-lg bg-[#F5F5F5] flex justify-between w-full border rounded-lg hover:shadow-md hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-gray-400 border-r-4">
                <div className="flex flex-col justify-center w-full p-4">
                    <p className="text-blue-900 text-sm font-bold">Overdue Payments</p>
                    <div className="flex w-auto h-1 mt-2">
                        <div className="bg-gray-200 w-1/4 h-1"></div>
                        <div className="bg-gray-50 w-3/4 h-1"></div>
                    </div>
                </div>
                <p className="bg-gray-200 flex justify-center items-center p-4">
                    <span className="text-sm font-bold text-blue-900">40</span>
                </p>
            </div>

        </div>


    )
}

export default TopCards
