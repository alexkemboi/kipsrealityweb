"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, LayoutDashboard } from "lucide-react";

const DashboardOverview = () => {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-blue-600 pb-2 inline-block">Agent Dashboard</h1>
                    <p className="text-gray-500 mt-2 italic">Welcome to your overview. This dashboard is currently being initialized.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-600">Total Listings</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">0</div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Manage your unit portfolio</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-600">Active Leads</CardTitle>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">0</div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Track potential tenant applications</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-600">Conversions</CardTitle>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <LayoutDashboard className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">0%</div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Your listing performance metrics</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-gray-200 border-dashed border-2">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No Activity Yet</h3>
                    <p className="text-gray-500 max-w-sm mt-2">
                        Once you start managing listings and processing applications, your performance data will be displayed here.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardOverview;
