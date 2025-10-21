"use client";
import React from "react";

const TopCards = () => {
  const cards = [
    {
      title: "Rent Status",
      value: "Paid",
      icon: "💰",
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
      progress: 75,
      progressColor: "bg-blue-500"
    },
    {
      title: "Lease Summary",
      value: "Active",
      icon: "📄",
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-700",
      progress: 66,
      progressColor: "bg-purple-500"
    },
    {
      title: "Upcoming Payments",
      value: "$500",
      icon: "📅",
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
      progress: 50,
      progressColor: "bg-emerald-500"
    },
    {
      title: "Maintenance Requests",
      value: "2 Pending",
      icon: "🔧",
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-700",
      progress: 33,
      progressColor: "bg-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 px-4 w-full">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Gradient Header */}
          <div className={`h-2 bg-gradient-to-r ${card.gradient}`}></div>
          
          {/* Card Content */}
          <div className="p-6">
            {/* Icon and Title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`text-3xl ${card.bgLight} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  {card.icon}
                </div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  {card.title}
                </h3>
              </div>
            </div>

            {/* Value Display */}
            <div className={`${card.bgLight} rounded-xl p-4 mb-4`}>
              <p className={`text-2xl font-bold ${card.textColor} text-center`}>
                {card.value}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Progress</span>
                <span>{card.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`${card.progressColor} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${card.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div className={`h-1 bg-gradient-to-r ${card.gradient} opacity-50`}></div>
        </div>
      ))}
    </div>
  );
};

export default TopCards;