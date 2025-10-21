"use client";
import React from "react";

const TopCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 px-4 bg-transparent w-full">
      {/* Rent Status Card */}
      <div className="shadow-md bg-[#F5F5F5] flex justify-between items-center border rounded-xl hover:shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-blue-400 border-r-4 p-4">
        <div className="flex flex-col justify-center w-full">
          <p className="text-blue-900 text-sm sm:text-base font-semibold">
            Rent Status
          </p>
          <div className="flex w-full h-1 mt-2">
            <div className="bg-blue-200 w-3/4 h-1"></div>
            <div className="bg-gray-50 w-1/4 h-1"></div>
          </div>
        </div>
        <p className="bg-blue-200 flex justify-center items-center px-3 py-2 rounded-md">
          <span className="text-sm sm:text-base font-bold text-blue-900">
            Paid
          </span>
        </p>
      </div>

      {/* Lease Summary Card */}
      <div className="shadow-md bg-[#F5F5F5] flex justify-between items-center border rounded-xl hover:shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-red-400 border-r-4 p-4">
        <div className="flex flex-col justify-center w-full">
          <p className="text-blue-900 text-sm sm:text-base font-semibold">
            Lease Summary
          </p>
          <div className="flex w-full h-1 mt-2">
            <div className="bg-red-200 w-2/3 h-1"></div>
            <div className="bg-gray-50 w-1/3 h-1"></div>
          </div>
        </div>
        <p className="bg-red-200 flex justify-center items-center px-3 py-2 rounded-md">
          <span className="text-sm sm:text-base font-bold text-blue-900">
            Active
          </span>
        </p>
      </div>

      {/* Upcoming Payments Card */}
      <div className="shadow-md bg-[#F5F5F5] flex justify-between items-center border rounded-xl hover:shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-green-500 border-r-4 p-4">
        <div className="flex flex-col justify-center w-full">
          <p className="text-blue-900 text-sm sm:text-base font-semibold">
            Upcoming Payments
          </p>
          <div className="flex w-full h-1 mt-2">
            <div className="bg-green-200 w-1/2 h-1"></div>
            <div className="bg-gray-50 w-1/2 h-1"></div>
          </div>
        </div>
        <p className="bg-green-200 flex justify-center items-center px-3 py-2 rounded-md">
          <span className="text-sm sm:text-base font-bold text-blue-900">
            $500
          </span>
        </p>
      </div>

      {/* Maintenance Requests Card */}
      <div className="shadow-md bg-[#F5F5F5] flex justify-between items-center border rounded-xl hover:shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out border-solid border-yellow-400 border-r-4 p-4">
        <div className="flex flex-col justify-center w-full">
          <p className="text-blue-900 text-sm sm:text-base font-semibold">
            Maintenance Requests
          </p>
          <div className="flex w-full h-1 mt-2">
            <div className="bg-yellow-200 w-1/3 h-1"></div>
            <div className="bg-gray-50 w-2/3 h-1"></div>
          </div>
        </div>
        <p className="bg-yellow-200 flex justify-center items-center px-3 py-2 rounded-md">
          <span className="text-sm sm:text-base font-bold text-blue-900">
            2 Pending
          </span>
        </p>
      </div>
    </div>
  );
};

export default TopCards;
