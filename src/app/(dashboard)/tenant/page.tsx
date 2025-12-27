"use client"
import React from "react";
import { useAuth } from "@/context/AuthContext";

const DashboardPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-[#F5F5F5] h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if floating (no organization)
  const isFloating = !user?.organization;

  if (isFloating) {
    return (
      <div className="bg-[#F5F5F5] h-full p-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Welcome to RentFlow360!</h1>
          <p className="text-lg text-gray-600 mb-8">You are not linked to any property yet.</p>

          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Have an Invite Code?</h3>
              <p className="text-blue-700 mb-4">Check your email for a link from your landlord or property manager.</p>
              <p className="text-sm text-blue-600">If you have received an invitation, click the link to join your property.</p>
            </div>

            <div className="p-6 border rounded-lg bg-white border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Looking for a place?</h3>
              <p className="text-gray-600 mb-4">Browse available properties and apply to rent.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Browse Listings (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Anchored user - show dashboard
  return (
    <div className="bg-[#F5F5F5] h-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Home</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
          <p className="text-sm text-gray-500 mt-2">Organization: {user?.organization?.name}</p>
          {/* Add lease details, pay rent button, etc. */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

